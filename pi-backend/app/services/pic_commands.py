"""
Xử lý lệnh từ PIC (CMD_*) — nguồn sự thật vẫn là DB trên Pi.

Vòng MVP: không có NRF thật; các hàm này gọi được từ test, **HTTP dev** (`/api/v1/dev/...` khi `PI_DEBUG=1`), hoặc worker RF sau này.
Trả về dict đơn giản mô phỏng payload ACK (snapshot ngắn cho LCD).
"""

from __future__ import annotations

from datetime import datetime

from sqlmodel import Session, select

from app.core.enums import OrderStatus, PaymentStatus, TableState
from app.models.entities import DiningTable, OrderItem, Payment, RestaurantOrder


def _table_by_code(session: Session, table_code: int) -> DiningTable | None:
    return session.exec(select(DiningTable).where(DiningTable.code == table_code)).first()


def apply_kitchen_done(session: Session, *, order_id: int) -> dict:
    """CMD_KITCHEN_DONE: IN_KITCHEN → DONE."""
    order = session.get(RestaurantOrder, order_id)
    if not order:
        return {"ack": False, "err": "ORDER_NOT_FOUND"}
    if order.status != OrderStatus.IN_KITCHEN:
        return {"ack": True, "idempotent": True, "order_id": order_id, "status": order.status.value}
    order.status = OrderStatus.DONE
    order.updated_at = datetime.utcnow()
    session.add(order)
    if order.table_db_id:
        t = session.get(DiningTable, order.table_db_id)
        if t:
            t.updated_at = datetime.utcnow()
            session.add(t)
    session.commit()
    return {"ack": True, "order_id": order_id, "status": OrderStatus.DONE.value}


def apply_counter_lookup(session: Session, *, table_code: int) -> dict:
    """
    CMD_COUNTER_LOOKUP mặc định theo table_id (D-17).
    Không đổi trạng thái (MVP không dùng PENDING_AT_COUNTER).
    """
    t = _table_by_code(session, table_code)
    if not t or t.active_order_id is None:
        return {"ack": False, "err": "NOT_FOUND", "table_id": table_code}
    order = session.get(RestaurantOrder, t.active_order_id)
    if not order:
        return {"ack": False, "err": "ORDER_NOT_FOUND"}
    pay = session.exec(select(Payment).where(Payment.order_id == order.id)).first()
    pay_state = pay.status.value if pay else PaymentStatus.NONE.value
    total = pay.total_minor if pay else _sum_order_minor(session, order.id)
    return {
        "ack": True,
        "table_id": table_code,
        "order_id": order.id,
        "total_minor": total,
        "payment_state": pay_state,
        "order_status": order.status.value,
    }


def apply_counter_paid(session: Session, *, table_code: int) -> dict:
    """CMD_COUNTER_PAID: REQUESTED → PAID, bàn → SETTLED (web admin không chốt tiền chính)."""
    t = _table_by_code(session, table_code)
    if not t or t.active_order_id is None:
        return {"ack": False, "err": "NOT_FOUND"}
    order = session.get(RestaurantOrder, t.active_order_id)
    if not order:
        return {"ack": False, "err": "ORDER_NOT_FOUND"}
    pay = session.exec(select(Payment).where(Payment.order_id == order.id)).first()
    if not pay or pay.status != PaymentStatus.REQUESTED:
        if pay and pay.status == PaymentStatus.PAID:
            return {"ack": True, "idempotent": True, "table_id": table_code, "order_id": order.id}
        return {"ack": False, "err": "PAYMENT_NOT_REQUESTED"}
    pay.status = PaymentStatus.PAID
    pay.updated_at = datetime.utcnow()
    t.state = TableState.SETTLED
    t.updated_at = datetime.utcnow()
    session.add(pay)
    session.add(t)
    session.commit()
    return {"ack": True, "table_id": table_code, "order_id": order.id, "payment": PaymentStatus.PAID.value}


def _sum_order_minor(session: Session, order_id: int) -> int:
    lines = session.exec(select(OrderItem).where(OrderItem.order_id == order_id)).all()
    return sum(li.quantity * li.unit_price_minor for li in lines)
