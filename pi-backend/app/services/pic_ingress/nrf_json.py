"""
Adapter mock / lab: UTF-8 JSON → :class:`PicIngressIn`.

Firmware thật có thể thay bằng parser binary (header + payload) gọi cùng ``PicIngressIn``.
"""

from __future__ import annotations

import json
from typing import Any

from app.services.pic_ingress.types import PicIngressCommand, PicIngressIn


class PicIngressDecodeError(ValueError):
    """Gói không parse được hoặc thiếu trường bắt buộc."""


def decode_pic_command_json(raw: bytes | str) -> PicIngressIn:
    """
    JSON tối thiểu::

        {"cmd": "CMD_KITCHEN_DONE", "table_code": 6}

    Alias: ``command`` thay ``cmd``; ``table_id`` thay ``table_code`` (cùng nghĩa mã bàn).
    """
    if isinstance(raw, bytes):
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError as e:
            raise PicIngressDecodeError("payload is not valid UTF-8") from e
    else:
        text = raw
    try:
        obj: Any = json.loads(text)
    except json.JSONDecodeError as e:
        raise PicIngressDecodeError("invalid JSON") from e
    if not isinstance(obj, dict):
        raise PicIngressDecodeError("JSON root must be an object")

    cmd_raw = obj.get("cmd") if obj.get("cmd") is not None else obj.get("command")
    if cmd_raw is None:
        raise PicIngressDecodeError("missing cmd/command")
    if not isinstance(cmd_raw, str):
        raise PicIngressDecodeError("cmd/command must be a string")

    try:
        command = PicIngressCommand(cmd_raw)
    except ValueError as e:
        raise PicIngressDecodeError(f"unknown cmd: {cmd_raw!r}") from e

    tc = obj.get("table_code") if obj.get("table_code") is not None else obj.get("table_id")
    if tc is None:
        raise PicIngressDecodeError("missing table_code/table_id")
    if isinstance(tc, bool) or not isinstance(tc, int):
        try:
            tc = int(tc)
        except (TypeError, ValueError) as e:
            raise PicIngressDecodeError("table_code/table_id must be an integer") from e
    if tc <= 0:
        raise PicIngressDecodeError("table_code must be positive")

    return PicIngressIn(command=command, table_code=int(tc))
