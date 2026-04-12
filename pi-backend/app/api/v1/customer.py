from __future__ import annotations

import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_bridge_dep, get_db_session
from app.models.entities import MenuItem, OrderItem, Payment, RestaurantOrder
from app.schemas.customer import UpsertOrderBody
from app.services.order_service import LineIn, OrderFlowError, get_table_by_code, sum_order_minor, upsert_active_order
from app.services.order_service import request_payment as do_request_payment
from app.services.pic_bridge import StubPicBridge

router = APIRouter(prefix="/customer", tags=["customer"])

CATEGORIES = [
    {"id": "khai-vi", "label": "Khai vị chay"},
    {"id": "mon-nong", "label": "Món nóng"},
    {"id": "com", "label": "Cơm — phần ăn"},
    {"id": "bun", "label": "Bún — miến"},
    {"id": "uong", "label": "Đồ uống"},
    {"id": "trang-mieng", "label": "Tráng miệng chay"},
]


@router.get("/tables/{table_id}")
def get_table(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict:
    t = get_table_by_code(session, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="TABLE_NOT_FOUND")
    active = None
    if t.active_order_id:
        o = session.get(RestaurantOrder, t.active_order_id)
        if o:
            active = {
                "id": o.id,
                "displayId": f"#ORD-{o.id}",
                "status": o.status.value,
                "totalVnd": sum_order_minor(session, o.id),
            }
    return {
        "tableCode": t.code,
        "label": t.label,
        "state": t.state.value,
        "activeOrder": active,
    }


@router.get("/menu")
def get_menu(session: Annotated[Session, Depends(get_db_session)]) -> dict:
    items = session.exec(select(MenuItem).order_by(MenuItem.category_id, MenuItem.name)).all()
    out = []
    for m in items:
        try:
            tags = json.loads(m.tags_json) if m.tags_json else []
        except json.JSONDecodeError:
            tags = []
        out.append(
            {
                "id": m.id,
                "name": m.name,
                "priceVnd": m.price_minor,
                "categoryId": m.category_id,
                "imageUrl": m.image_url or "",
                "tags": tags,
            }
        )
    return {"categories": CATEGORIES, "items": out}


@router.get("/tables/{table_id}/orders/active")
def get_active_order(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict:
    t = get_table_by_code(session, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="TABLE_NOT_FOUND")
    if t.active_order_id is None:
        return {"order": None}
    order = session.get(RestaurantOrder, t.active_order_id)
    if not order:
        return {"order": None}
    lines = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    pay = session.exec(select(Payment).where(Payment.order_id == order.id)).first()
    line_out = []
    for li in lines:
        mi = session.get(MenuItem, li.menu_item_id)
        line_out.append(
            {
                "menuItemId": li.menu_item_id,
                "name": mi.name if mi else li.menu_item_id,
                "unitPriceVnd": li.unit_price_minor,
                "quantity": li.quantity,
                "imageUrl": (mi.image_url if mi else "") or "",
                "lineNote": li.line_note or "",
            }
        )
    return {
        "order": {
            "id": order.id,
            "displayId": f"#ORD-{order.id}",
            "status": order.status.value,
            "note": order.note or "",
            "lines": line_out,
            "totalVnd": sum_order_minor(session, order.id),
            "payment": {"status": pay.status.value if pay else "NONE"},
        }
    }


@router.post("/tables/{table_id}/orders/active")
def post_active_order(
    table_id: int,
    body: UpsertOrderBody,
    session: Annotated[Session, Depends(get_db_session)],
    bridge: Annotated[StubPicBridge, Depends(get_bridge_dep)],
) -> dict:
    lines = [
        LineIn(menu_item_id=li.menu_item_id, quantity=li.quantity, line_note=li.line_note) for li in body.lines
    ]
    try:
        order = upsert_active_order(
            session,
            table_code=table_id,
            lines=lines,
            order_note=body.order_note,
            bridge=bridge,
        )
    except OrderFlowError as e:
        raise HTTPException(status_code=e.http_status, detail={"code": e.code, "message": str(e)}) from e
    return {
        "orderId": order.id,
        "displayId": f"#ORD-{order.id}",
        "status": order.status.value,
        "totalVnd": sum_order_minor(session, order.id),
    }


@router.post("/tables/{table_id}/payment/request")
def post_payment_request(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
    bridge: Annotated[StubPicBridge, Depends(get_bridge_dep)],
) -> dict:
    try:
        pay = do_request_payment(session, table_code=table_id, bridge=bridge)
    except OrderFlowError as e:
        raise HTTPException(status_code=e.http_status, detail={"code": e.code, "message": str(e)}) from e
    return {
        "paymentStatus": pay.status.value,
        "totalVnd": pay.total_minor,
        "orderId": pay.order_id,
    }
