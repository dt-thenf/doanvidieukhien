"""
Binary frame Pi ↔ PIC (giao thức ``v1``) — PIC→Pi ``CMD_*`` → :class:`PicIngressIn`.

Đặc tả: ``docs/architecture/pi-pic-protocol.md``. Endian: little-endian.
"""

from __future__ import annotations

from enum import IntEnum

from app.services.pic_ingress.nrf_json import PicIngressDecodeError
from app.services.pic_ingress.types import PicIngressCommand, PicIngressIn

PROTO_VER = 1
FRAME_LEN = 32
HEADER_LEN = 4
MAX_PAYLOAD = FRAME_LEN - HEADER_LEN

# --- MSG_TYPE (u8) — bảng chốt A06.1 ---


class MsgType(IntEnum):
    PING = 0x01
    PONG = 0x02
    ACK = 0x03
    NACK = 0x04
    EVT_ORDER_NEW = 0x10
    EVT_PAYMENT_PENDING = 0x11
    CMD_KITCHEN_DONE = 0x20
    CMD_COUNTER_LOOKUP = 0x21
    CMD_COUNTER_PAID = 0x22


LOOKUP_BY_TABLE_CODE = 0


def _u16_le(buf: bytes, offset: int) -> int:
    return buf[offset] | (buf[offset + 1] << 8)


def decode_pic_command_binary(frame: bytes) -> PicIngressIn:
    """
    Parse một frame 32 byte (NRF payload đầy) thành ``PicIngressIn``.

    Chỉ chấp nhận ``MSG_TYPE`` thuộc nhóm ``CMD_*`` dùng cho ingress hiện tại.
    """
    if len(frame) != FRAME_LEN:
        raise PicIngressDecodeError(f"frame length must be {FRAME_LEN}, got {len(frame)}")
    ver = frame[0]
    if ver != PROTO_VER:
        raise PicIngressDecodeError(f"unsupported protocol version {ver!r}, expected {PROTO_VER}")
    msg_type = frame[1]
    payload = frame[HEADER_LEN:]

    if msg_type == MsgType.CMD_KITCHEN_DONE:
        if _nonzero_tail(payload, 2):
            raise PicIngressDecodeError("CMD_KITCHEN_DONE: garbage after table_code")
        tc = _u16_le(payload, 0)
        if tc == 0:
            raise PicIngressDecodeError("table_code must be positive")
        return PicIngressIn(command=PicIngressCommand.CMD_KITCHEN_DONE, table_code=tc)

    if msg_type == MsgType.CMD_COUNTER_LOOKUP:
        if payload[0] != LOOKUP_BY_TABLE_CODE:
            raise PicIngressDecodeError("CMD_COUNTER_LOOKUP: only lookup_kind=0 (table_code) is supported")
        if _nonzero_tail(payload, 3):
            raise PicIngressDecodeError("CMD_COUNTER_LOOKUP: garbage after fields")
        tc = _u16_le(payload, 1)
        if tc == 0:
            raise PicIngressDecodeError("table_code must be positive")
        return PicIngressIn(command=PicIngressCommand.CMD_COUNTER_LOOKUP, table_code=tc)

    if msg_type == MsgType.CMD_COUNTER_PAID:
        if _nonzero_tail(payload, 2):
            raise PicIngressDecodeError("CMD_COUNTER_PAID: garbage after table_code")
        tc = _u16_le(payload, 0)
        if tc == 0:
            raise PicIngressDecodeError("table_code must be positive")
        return PicIngressIn(command=PicIngressCommand.CMD_COUNTER_PAID, table_code=tc)

    raise PicIngressDecodeError(f"not a PIC ingress CMD message: MSG_TYPE=0x{msg_type:02x}")


def _nonzero_tail(payload: bytes, used: int) -> bool:
    return any(b != 0 for b in payload[used:])


def pack_frame(ver: int, msg_type: int, seq: int, flags: int, payload: bytes) -> bytes:
    """Đóng gói frame đầy 32 byte (padding 0). Dùng trong test / script lab."""
    if len(payload) > MAX_PAYLOAD:
        raise ValueError("payload too large")
    head = bytes([ver & 0xFF, msg_type & 0xFF, seq & 0xFF, flags & 0xFF])
    return (head + payload).ljust(FRAME_LEN, b"\x00")


def build_cmd_kitchen_done_frame(*, seq: int, table_code: int, flags: int = 0) -> bytes:
    pl = int(table_code).to_bytes(2, "little")
    return pack_frame(PROTO_VER, MsgType.CMD_KITCHEN_DONE, seq, flags, pl)


def build_cmd_counter_lookup_frame(*, seq: int, table_code: int, flags: int = 0) -> bytes:
    pl = bytes([LOOKUP_BY_TABLE_CODE]) + int(table_code).to_bytes(2, "little")
    return pack_frame(PROTO_VER, MsgType.CMD_COUNTER_LOOKUP, seq, flags, pl)


def build_cmd_counter_paid_frame(*, seq: int, table_code: int, flags: int = 0) -> bytes:
    pl = int(table_code).to_bytes(2, "little")
    return pack_frame(PROTO_VER, MsgType.CMD_COUNTER_PAID, seq, flags, pl)


# --- Pi -> PIC frames (A06.5 RF link test) ---


def build_pong_frame(*, seq: int, flags: int = 0) -> bytes:
    """PONG payload empty for bring-up."""
    return pack_frame(PROTO_VER, MsgType.PONG, seq, flags, b"")


def build_ack_frame(*, seq: int, flags: int = 0) -> bytes:
    """ACK payload empty for bring-up."""
    return pack_frame(PROTO_VER, MsgType.ACK, seq, flags, b"")


def build_nack_frame(*, seq: int, flags: int = 0) -> bytes:
    """NACK payload empty for bring-up."""
    return pack_frame(PROTO_VER, MsgType.NACK, seq, flags, b"")


def build_evt_order_new_frame(*, seq: int, flags: int = 0) -> bytes:
    """EVT_ORDER_NEW payload empty for bring-up."""
    return pack_frame(PROTO_VER, MsgType.EVT_ORDER_NEW, seq, flags, b"")


def build_evt_payment_pending_frame(*, seq: int, flags: int = 0) -> bytes:
    """EVT_PAYMENT_PENDING payload empty for bring-up."""
    return pack_frame(PROTO_VER, MsgType.EVT_PAYMENT_PENDING, seq, flags, b"")
