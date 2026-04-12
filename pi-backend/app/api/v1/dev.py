"""
Route chỉ dùng khi PI_DEBUG=1 — giả lập PIC để test local (không bật trên Pi production).

Không thay kiến trúc: vẫn gọi cùng logic `apply_kitchen_done` như khi có CMD_KITCHEN_DONE qua RF.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_db_session
from app.services.order_service import get_table_by_code
from app.services.pic_commands import apply_kitchen_done

router = APIRouter(prefix="/dev", tags=["dev-only"])


@router.post("/tables/{table_id}/kitchen-done")
def dev_kitchen_done(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict:
    """
    Giả `CMD_KITCHEN_DONE` cho **đơn active** của bàn (`active_order_id`).

    - Đơn `IN_KITCHEN` → `DONE`.
    - Nếu đã `DONE` / trạng thái khác: trả idempotent (ack) giống `pic_commands`.
    """
    t = get_table_by_code(session, table_id)
    if not t:
        raise HTTPException(status_code=404, detail={"code": "TABLE_NOT_FOUND", "message": "Không có bàn này"})
    if t.active_order_id is None:
        raise HTTPException(
            status_code=400,
            detail={"code": "NO_ACTIVE_ORDER", "message": "Bàn không có đơn active"},
        )
    result = apply_kitchen_done(session, order_id=t.active_order_id)
    if not result.get("ack"):
        raise HTTPException(status_code=400, detail=result)
    return result
