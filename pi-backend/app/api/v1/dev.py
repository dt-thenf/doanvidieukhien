"""
Route chỉ dùng khi PI_DEBUG=1 — giả lập PIC để test local (không bật trên Pi production).

Luồng nghiệp vụ: HTTP → ``pic_ingress.handle_pic_ingress`` → ``pic_commands.apply_*`` (cùng đường với RF sau này).
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_db_session
from app.services.pic_ingress import (
    PicIngressCommand,
    PicIngressIn,
    handle_pic_ingress,
)

router = APIRouter(prefix="/dev", tags=["dev-only"])


def _raise_ingress_http(result: dict) -> None:
    if result.get("ack"):
        return
    err = result.get("err")
    if err == "TABLE_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail={"code": "TABLE_NOT_FOUND", "message": "Không có bàn này"},
        )
    if err == "NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Không có bàn hoặc đơn active"},
        )
    if err == "NO_ACTIVE_ORDER":
        raise HTTPException(
            status_code=400,
            detail={"code": "NO_ACTIVE_ORDER", "message": "Bàn không có đơn active"},
        )
    raise HTTPException(status_code=400, detail=result)


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
    result = handle_pic_ingress(
        session,
        PicIngressIn(command=PicIngressCommand.CMD_KITCHEN_DONE, table_code=table_id),
    )
    if not result.get("ack"):
        _raise_ingress_http(result)
    return result


@router.post("/tables/{table_id}/counter-paid")
def dev_counter_paid(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict:
    """
    Giả `CMD_COUNTER_PAID` theo `table_id` (= `dining_table.code`).

    - `Payment` phải `REQUESTED` → `PAID`, bàn → `SETTLED`.
    - Đã `PAID`: idempotent (ack).
    - Không thay web admin làm chốt tiền thật; đây chỉ là shortcut test local khi `PI_DEBUG=1`.
    """
    result = handle_pic_ingress(
        session,
        PicIngressIn(command=PicIngressCommand.CMD_COUNTER_PAID, table_code=table_id),
    )
    if not result.get("ack"):
        _raise_ingress_http(result)
    return result
