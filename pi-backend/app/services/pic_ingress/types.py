"""Payload tối thiểu từ PIC → Pi (sau khi giải mã gói RF / bridge)."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class PicIngressCommand(StrEnum):
    """Khớp tên lệnh nghiệp vụ trong decision-log / pi-pic-protocol (CMD_*)."""

    CMD_KITCHEN_DONE = "CMD_KITCHEN_DONE"
    CMD_COUNTER_LOOKUP = "CMD_COUNTER_LOOKUP"
    CMD_COUNTER_PAID = "CMD_COUNTER_PAID"


@dataclass(frozen=True, slots=True)
class PicIngressIn:
    """
    Một lệnh đã parse, sẵn sàng vào domain.

    MVP: mọi lệnh định vị bàn bằng ``table_code`` (= ``dining_table.code``, QR / D-17).
    """

    command: PicIngressCommand
    table_code: int
