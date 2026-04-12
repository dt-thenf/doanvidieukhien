"""
Lớp cầu Pi ↔ PIC (NRF24L01) — vòng này chỉ stub/log.

Sự kiện tối thiểu: EVT_ORDER_NEW, EVT_PAYMENT_PENDING.
Lệnh PIC (CMD_*) xử lý nghiệp vụ nằm ở `pic_commands.py`; sau này worker RF gọi vào đó.
Theo D-19: Pi gửi lại tối đa 1 lần cho EVT_ORDER_NEW và EVT_PAYMENT_PENDING (stub dùng sleep ngắn).
"""

from __future__ import annotations

import logging
import time
from typing import Any, Protocol, runtime_checkable

logger = logging.getLogger(__name__)


@runtime_checkable
class PicBridge(Protocol):
    """Hợp đồng tối thiểu cho lớp gửi tin Pi → PIC (đẩy sự kiện)."""

    def emit_order_new(self, *, order_id: int, table_code: int) -> None: ...

    def emit_payment_pending(self, *, order_id: int, table_code: int) -> None: ...


class StubPicBridge:
    """Stub: ghi log + lưu lịch sử gửi (phục vụ demo/debug). Có retry 1 lần cho 2 EVT trên."""

    def __init__(self) -> None:
        self.history: list[dict[str, Any]] = []

    def _retry_sleep(self) -> None:
        time.sleep(0.12)

    def emit_order_new(self, *, order_id: int, table_code: int) -> None:
        self._emit_twice("EVT_ORDER_NEW", {"order_id": order_id, "table_id": table_code})

    def emit_payment_pending(self, *, order_id: int, table_code: int) -> None:
        self._emit_twice("EVT_PAYMENT_PENDING", {"order_id": order_id, "table_id": table_code})

    def _emit_twice(self, kind: str, payload: dict[str, Any]) -> None:
        for attempt in (1, 2):
            row = {"kind": kind, "payload": payload, "attempt": attempt}
            self.history.append(row)
            logger.info("PIC stub %s attempt=%s %s", kind, attempt, payload)
            if attempt == 1:
                self._retry_sleep()


_bridge_singleton: StubPicBridge | None = None


def get_pic_bridge() -> StubPicBridge:
    global _bridge_singleton
    if _bridge_singleton is None:
        _bridge_singleton = StubPicBridge()
    return _bridge_singleton
