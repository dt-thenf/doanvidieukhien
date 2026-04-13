"""PIC / NRF ingress — parse → ``handle_pic_ingress`` → ``pic_commands``."""

from app.services.pic_ingress.nrf_binary import (
    MsgType,
    build_ack_frame,
    build_cmd_counter_lookup_frame,
    build_cmd_counter_paid_frame,
    build_cmd_kitchen_done_frame,
    build_evt_order_new_frame,
    build_evt_payment_pending_frame,
    build_nack_frame,
    build_pong_frame,
    decode_pic_command_binary,
)
from app.services.pic_ingress.nrf_json import PicIngressDecodeError, decode_pic_command_json
from app.services.pic_ingress.service import handle_pic_ingress
from app.services.pic_ingress.types import PicIngressCommand, PicIngressIn
from app.services.pic_ingress.worker import handle_nrf_ingress_frame, run_ingress_loop

__all__ = [
    "MsgType",
    "PicIngressCommand",
    "PicIngressDecodeError",
    "PicIngressIn",
    "build_ack_frame",
    "build_cmd_counter_lookup_frame",
    "build_cmd_counter_paid_frame",
    "build_cmd_kitchen_done_frame",
    "build_evt_order_new_frame",
    "build_evt_payment_pending_frame",
    "build_nack_frame",
    "build_pong_frame",
    "decode_pic_command_binary",
    "decode_pic_command_json",
    "handle_nrf_ingress_frame",
    "handle_pic_ingress",
    "run_ingress_loop",
]
