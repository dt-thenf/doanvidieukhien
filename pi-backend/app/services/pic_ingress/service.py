"""
Ingress: lệnh đã parse (PIC / mock) → gọi ``pic_commands.apply_*`` — không nhân đôi nghiệp vụ.
"""

from __future__ import annotations

from typing import assert_never

from sqlmodel import Session

from app.services.order_service import get_table_by_code
from app.services.pic_commands import (
    apply_counter_lookup,
    apply_counter_paid,
    apply_kitchen_done,
)
from app.services.pic_ingress.types import PicIngressCommand, PicIngressIn


def handle_pic_ingress(session: Session, msg: PicIngressIn) -> dict:
    """
    Điểm vào thống nhất cho CMD_* từ RF (sau adapter) hoặc test.

    Trả về dict dạng ACK (khớp ``pic_commands``): ``ack``, ``err`` (khi lỗi), v.v.
    """
    if msg.command == PicIngressCommand.CMD_KITCHEN_DONE:
        t = get_table_by_code(session, msg.table_code)
        if not t:
            return {"ack": False, "err": "TABLE_NOT_FOUND", "table_code": msg.table_code}
        if t.active_order_id is None:
            return {"ack": False, "err": "NO_ACTIVE_ORDER", "table_code": msg.table_code}
        return apply_kitchen_done(session, order_id=t.active_order_id)

    if msg.command == PicIngressCommand.CMD_COUNTER_LOOKUP:
        return apply_counter_lookup(session, table_code=msg.table_code)

    if msg.command == PicIngressCommand.CMD_COUNTER_PAID:
        return apply_counter_paid(session, table_code=msg.table_code)

    assert_never(msg.command)
