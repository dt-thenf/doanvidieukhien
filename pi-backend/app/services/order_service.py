from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlmodel import Session, select

from app.core.enums import OrderStatus, PaymentStatus, TableState
from app.lib.time_fmt import format_relative_vi
from app.models.entities import DiningTable, MenuItem, OrderItem, Payment, RestaurantOrder
from app.services.pic_bridge import PicBridge


@dataclass
class LineIn:
    menu_item_id: str
    quantity: int
    line_note: str = ""


class OrderFlowError(Exception):
    def __init__(self, code: str, message: str, http_status: int = 400):
        super().__init__(message)
        self.code = code
        self.http_status = http_status


def get_table_by_code(session: Session, table_code: int) -> DiningTable | None:
    return session.exec(select(DiningTable).where(DiningTable.code == table_code)).first()


def sum_order_minor(session: Session, order_id: int) -> int:
    lines = session.exec(select(OrderItem).where(OrderItem.order_id == order_id)).all()
    return sum(li.quantity * li.unit_price_minor for li in lines)


def upsert_active_order(
    session: Session,
    *,
    table_code: int,
    lines: list[LineIn],
    order_note: str,
    bridge: PicBridge,
) -> RestaurantOrder:
    if not lines:
        raise OrderFlowError("EMPTY_CART", "Giỏ không có món hợp lệ", 400)

    t = get_table_by_code(session, table_code)
    if not t:
        raise OrderFlowError("TABLE_NOT_FOUND", "Không có bàn này", 404)

    if t.state in (TableState.PAYMENT_REQUESTED, TableState.SETTLED):
        raise OrderFlowError("TABLE_CLOSED_FOR_ORDER", "Bàn không nhận gọi món ở trạng thái hiện tại", 409)

    if t.state == TableState.IDLE:
        t.state = TableState.OPEN

    now = datetime.utcnow()
    t.updated_at = now

    order: RestaurantOrder | None = None
    if t.active_order_id:
        order = session.get(RestaurantOrder, t.active_order_id)
        if order and order.status == OrderStatus.DONE:
            raise OrderFlowError("ORDER_DONE", "Đơn đã xong — không gọi thêm món qua đơn này", 409)
        if order and order.status not in (OrderStatus.NEW, OrderStatus.IN_KITCHEN):
            raise OrderFlowError("BAD_ORDER_STATE", "Trạng thái đơn không cho phép cập nhật", 409)

    if order is None:
        order = RestaurantOrder(
            table_db_id=t.id,
            status=OrderStatus.IN_KITCHEN,
            note=order_note or "",
            created_at=now,
            updated_at=now,
        )
        session.add(order)
        session.flush()
        t.active_order_id = order.id
    else:
        order.note = order_note or ""
        order.status = OrderStatus.IN_KITCHEN
        order.updated_at = now
        session.add(order)
        existing = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
        for li in existing:
            session.delete(li)
        session.flush()

    for li in lines:
        item = session.get(MenuItem, li.menu_item_id)
        if not item:
            raise OrderFlowError("MENU_ITEM_NOT_FOUND", f"Không có món {li.menu_item_id}", 404)
        if li.quantity < 1:
            raise OrderFlowError("BAD_QTY", "Số lượng không hợp lệ", 400)
        session.add(
            OrderItem(
                order_id=order.id,
                menu_item_id=item.id,
                quantity=li.quantity,
                unit_price_minor=item.price_minor,
                line_note=li.line_note or "",
            )
        )

    session.add(t)
    session.commit()
    session.refresh(order)

    bridge.emit_order_new(order_id=order.id, table_code=t.code)
    return order


def request_payment(
    session: Session,
    *,
    table_code: int,
    bridge: PicBridge,
) -> Payment:
    t = get_table_by_code(session, table_code)
    if not t:
        raise OrderFlowError("TABLE_NOT_FOUND", "Không có bàn này", 404)
    if t.active_order_id is None:
        raise OrderFlowError("NO_ORDER", "Bàn chưa có đơn để thanh toán", 400)

    order = session.get(RestaurantOrder, t.active_order_id)
    if not order:
        raise OrderFlowError("NO_ORDER", "Bàn chưa có đơn để thanh toán", 400)
    if order.status != OrderStatus.DONE:
        raise OrderFlowError("ORDER_NOT_DONE", "Chỉ yêu cầu thanh toán khi bếp đã xong đơn", 400)

    total = sum_order_minor(session, order.id)
    pay = session.exec(select(Payment).where(Payment.order_id == order.id)).first()
    now = datetime.utcnow()
    should_emit = False

    if pay is None:
        pay = Payment(
            order_id=order.id,
            table_db_id=t.id,
            status=PaymentStatus.REQUESTED,
            total_minor=total,
            requested_at=now,
            updated_at=now,
        )
        session.add(pay)
        should_emit = True
    elif pay.status == PaymentStatus.NONE:
        pay.status = PaymentStatus.REQUESTED
        pay.total_minor = total
        pay.requested_at = now
        pay.updated_at = now
        session.add(pay)
        should_emit = True
    elif pay.status == PaymentStatus.REQUESTED:
        pass  # idempotent — không gửi EVT lại
    elif pay.status == PaymentStatus.PAID:
        raise OrderFlowError("ALREADY_PAID", "Đơn đã được chốt thanh toán", 409)

    t.state = TableState.PAYMENT_REQUESTED
    t.updated_at = now
    session.add(t)
    session.commit()
    session.refresh(pay)

    if should_emit:
        bridge.emit_payment_pending(order_id=order.id, table_code=t.code)
    return pay


def reset_settled_table(session: Session, *, table_code: int) -> DiningTable:
    t = get_table_by_code(session, table_code)
    if not t:
        raise OrderFlowError("TABLE_NOT_FOUND", "Không có bàn này", 404)
    if t.state != TableState.SETTLED:
        raise OrderFlowError("NOT_SETTLED", "Chỉ reset khi bàn đã SETTLED", 409)
    t.state = TableState.IDLE
    t.active_order_id = None
    t.updated_at = datetime.utcnow()
    session.add(t)
    session.commit()
    session.refresh(t)
    return t


def admin_tables_overview(session: Session) -> list[dict]:
    rows: list[dict] = []
    tables = session.exec(select(DiningTable).order_by(DiningTable.code)).all()
    for t in tables:
        order_id_str = None
        total = 0
        if t.active_order_id:
            o = session.get(RestaurantOrder, t.active_order_id)
            if o:
                order_id_str = f"#ORD-{o.id}"
                total = sum_order_minor(session, o.id)
        rows.append(
            {
                "id": str(t.code),
                "label": t.label,
                "state": t.state.value,
                "orderId": order_id_str,
                "totalVnd": total,
                "updatedAgo": format_relative_vi(t.updated_at),
            }
        )
    return rows


def admin_payment_queue(session: Session) -> list[dict]:
    q: list[dict] = []
    pays = session.exec(
        select(Payment)
        .where(Payment.status == PaymentStatus.REQUESTED)
        .order_by(Payment.requested_at)
    ).all()
    for p in pays:
        t = session.get(DiningTable, p.table_db_id)
        if not t:
            continue
        q.append(
            {
                "tableLabel": t.label,
                "tableCode": t.code,
                "orderId": f"#ORD-{p.order_id}",
                "totalVnd": p.total_minor,
                "requestedAgo": format_relative_vi(p.requested_at or p.updated_at),
                "paymentStatus": p.status.value,
            }
        )
    return q


def admin_order_detail(session: Session, *, table_code: int) -> dict:
    t = get_table_by_code(session, table_code)
    if not t:
        raise OrderFlowError("TABLE_NOT_FOUND", "Không có bàn này", 404)
    if t.active_order_id is None:
        raise OrderFlowError("NO_ORDER", "Bàn không có đơn active", 404)
    order = session.get(RestaurantOrder, t.active_order_id)
    if not order:
        raise OrderFlowError("NO_ORDER", "Bàn không có đơn active", 404)

    lines = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    previews: list[dict] = []
    for li in lines:
        mi = session.get(MenuItem, li.menu_item_id)
        name = mi.name if mi else li.menu_item_id
        previews.append(
            {
                "name": name,
                "note": li.line_note or None,
                "qty": li.quantity,
            }
        )
    pay = session.exec(select(Payment).where(Payment.order_id == order.id)).first()
    return {
        "table": {"code": t.code, "label": t.label, "state": t.state.value},
        "order": {
            "id": order.id,
            "displayId": f"#ORD-{order.id}",
            "status": order.status.value,
            "note": order.note or None,
            "totalVnd": sum_order_minor(session, order.id),
        },
        "lines": previews,
        "payment": (
            {
                "status": pay.status.value,
                "totalVnd": pay.total_minor,
                "requestedAt": pay.requested_at.isoformat() if pay and pay.requested_at else None,
            }
            if pay
            else {"status": PaymentStatus.NONE.value, "totalVnd": 0, "requestedAt": None}
        ),
    }
