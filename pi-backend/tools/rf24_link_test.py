"""
RF link test — Pi <-> PIC over NRF24L01 (A06.5)

Mục tiêu: beginner test được link RF 32-byte frame theo
`docs/architecture/pi-pic-protocol.md`.

Tham số RF phải khớp PIC firmware hiện tại:
- channel: 76
- address: E7E7E7E7E7 (5 byte)
- data rate: 1Mbps
- payload: 32 byte
- auto-ack: OFF (bring-up)

Yêu cầu:
- Raspberry Pi bật SPI
- NRF24L01 wiring đúng (CE/CSN theo GPIO của Pi)
- Python binding RF24 (TMRh20) cài được:
  - thử `pip install RF24`
"""

from __future__ import annotations

import argparse
import sys
import time

from app.services.pic_ingress.nrf_binary import (
    MsgType,
    build_ack_frame,
    build_evt_order_new_frame,
    build_evt_payment_pending_frame,
    build_nack_frame,
    build_pong_frame,
    decode_pic_command_binary,
)
from app.services.pic_ingress.nrf_json import PicIngressDecodeError


def _try_import_rf24():
    try:
        # Common python binding name
        from RF24 import RF24, RF24_PA_LOW, RF24_1MBPS  # type: ignore

        return RF24, RF24_PA_LOW, RF24_1MBPS
    except Exception:
        return None


def _hex32(b: bytes) -> str:
    return b.hex(" ", 1)


def _addr_bytes(hex_str: str) -> bytes:
    s = hex_str.strip().replace(":", "").replace(" ", "")
    if len(s) != 10:
        raise ValueError("addr phải là 10 hex chars (5 bytes), ví dụ E7E7E7E7E7")
    return bytes.fromhex(s)


def _build_radio(*, ce_pin: int, csn_pin: int, spi_bus: int, spi_device: int):
    rf24 = _try_import_rf24()
    if rf24 is None:
        raise RuntimeError(
            "Không import được RF24 python bindings. "
            "Hãy cài RF24 cho Raspberry Pi (ví dụ: `pip install RF24`)."
        )

    RF24, RF24_PA_LOW, RF24_1MBPS = rf24

    # RF24 python (TMRh20) thường nhận (cePin, csnPin, spispeed?, spiBus?, spiDevice?).
    # Chúng ta thử các signature phổ biến để giảm friction.
    radio = None
    last_err: Exception | None = None
    for ctor_args in (
        (ce_pin, csn_pin, 8_000_000, spi_bus, spi_device),
        (ce_pin, csn_pin, spi_bus, spi_device),
        (ce_pin, csn_pin),
    ):
        try:
            radio = RF24(*ctor_args)  # type: ignore[misc]
            break
        except Exception as e:  # noqa: BLE001
            last_err = e
            continue
    if radio is None:
        raise RuntimeError(f"Không khởi tạo được RF24(): {last_err!r}")

    return radio, RF24_PA_LOW, RF24_1MBPS


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--channel", type=int, default=76)
    p.add_argument("--addr", type=str, default="E7E7E7E7E7")
    p.add_argument("--ce-pin", type=int, default=22, help="GPIO CE (BCM). Default 22")
    p.add_argument("--csn-pin", type=int, default=0, help="CSN for SPI device (often 0 for CE0).")
    p.add_argument("--spi-bus", type=int, default=0)
    p.add_argument("--spi-device", type=int, default=0)
    p.add_argument("--listen", action="store_true")
    p.add_argument("--send-evt-order-new", action="store_true")
    p.add_argument("--send-evt-payment-pending", action="store_true")
    p.add_argument("--seq", type=int, default=1)
    args = p.parse_args(argv)

    addr = _addr_bytes(args.addr)

    try:
        radio, RF24_PA_LOW, RF24_1MBPS = _build_radio(
            ce_pin=args.ce_pin, csn_pin=args.csn_pin, spi_bus=args.spi_bus, spi_device=args.spi_device
        )
    except Exception as e:
        print(str(e), file=sys.stderr)
        return 2

    if not radio.begin():  # type: ignore[attr-defined]
        print("RF24 begin() failed. Kiểm tra SPI enabled + wiring.", file=sys.stderr)
        return 2

    # Config match PIC
    radio.setChannel(args.channel)  # type: ignore[attr-defined]
    radio.setDataRate(RF24_1MBPS)  # type: ignore[attr-defined]
    radio.setPALevel(RF24_PA_LOW)  # type: ignore[attr-defined]
    radio.setPayloadSize(32)  # type: ignore[attr-defined]
    radio.setAutoAck(False)  # type: ignore[attr-defined]

    # Same address for RX pipe0 and TX address (bring-up)
    radio.openReadingPipe(1, addr)  # type: ignore[attr-defined]
    radio.openWritingPipe(addr)  # type: ignore[attr-defined]
    radio.startListening()  # type: ignore[attr-defined]

    def send_frame(frame: bytes) -> bool:
        radio.stopListening()  # type: ignore[attr-defined]
        ok = bool(radio.write(frame))  # type: ignore[attr-defined]
        radio.startListening()  # type: ignore[attr-defined]
        return ok

    if args.send_evt_order_new:
        f = build_evt_order_new_frame(seq=args.seq)
        print("TX EVT_ORDER_NEW:", _hex32(f))
        print("write() ->", send_frame(f))

    if args.send_evt_payment_pending:
        f = build_evt_payment_pending_frame(seq=args.seq)
        print("TX EVT_PAYMENT_PENDING:", _hex32(f))
        print("write() ->", send_frame(f))

    if args.listen:
        print("Listening. Will reply: PONG to PING, ACK to CMD_* (same SEQ). Ctrl+C to stop.")
        try:
            while True:
                if radio.available():  # type: ignore[attr-defined]
                    buf = bytes(radio.read(32))  # type: ignore[attr-defined]
                    if len(buf) != 32:
                        continue
                    ver, msg_type, seq = buf[0], buf[1], buf[2]
                    print("RX:", _hex32(buf))

                    if ver != 1:
                        continue

                    if msg_type == int(MsgType.PING):
                        out = build_pong_frame(seq=seq)
                        print("TX PONG:", _hex32(out), "->", send_frame(out))
                        continue

                    # CMD_* from PIC -> decode + ACK/NACK
                    try:
                        _ = decode_pic_command_binary(buf)
                        out = build_ack_frame(seq=seq)
                        print("TX ACK:", _hex32(out), "->", send_frame(out))
                    except PicIngressDecodeError:
                        out = build_nack_frame(seq=seq)
                        print("TX NACK:", _hex32(out), "->", send_frame(out))
                time.sleep(0.01)
        except KeyboardInterrupt:
            return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

