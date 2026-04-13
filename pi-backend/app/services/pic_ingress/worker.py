"""
Worker phía Pi: frame NRF thô → parse binary → ``handle_pic_ingress``.

SPI / IRQ NRF thật nối vào ``read_frame`` (hoặc hàng đợi) — không mount thêm HTTP dev.
"""

from __future__ import annotations

import logging
import threading
import time
from collections.abc import Callable

from sqlmodel import Session

from app.services.pic_ingress.nrf_binary import decode_pic_command_binary
from app.services.pic_ingress.service import handle_pic_ingress

logger = logging.getLogger(__name__)


def handle_nrf_ingress_frame(session: Session, frame: bytes) -> dict:
    """Một frame 32 byte đã đọc từ NRF → cùng kết quả ACK dict như ``handle_pic_ingress``."""
    msg = decode_pic_command_binary(frame)
    return handle_pic_ingress(session, msg)


def run_ingress_loop(
    *,
    session_factory: Callable[[], Session],
    read_frame: Callable[[], bytes | None],
    stop: threading.Event,
    idle_sleep_s: float = 0.02,
    on_result: Callable[[dict], None] | None = None,
) -> None:
    """
    Vòng lặp blocking (thread riêng): đọc frame → xử lý trong session.

    ``read_frame`` trả ``None`` khi chưa có dữ liệu (worker ngủ ngắn).
    """
    while not stop.is_set():
        raw = read_frame()
        if raw is None:
            time.sleep(idle_sleep_s)
            continue
        try:
            with session_factory() as session:
                out = handle_nrf_ingress_frame(session, raw)
            if on_result:
                on_result(out)
            else:
                logger.info("pic ingress: %s", out)
        except Exception:
            logger.exception("pic ingress frame failed")
