"""Binary NRF frame → ``PicIngressIn`` / roundtrip với domain."""

from __future__ import annotations

from pathlib import Path

import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.seed import seed_if_empty
from app.services.pic_ingress import (
    PicIngressCommand,
    PicIngressDecodeError,
    build_cmd_counter_lookup_frame,
    build_cmd_counter_paid_frame,
    build_cmd_kitchen_done_frame,
    decode_pic_command_binary,
    handle_nrf_ingress_frame,
)


@pytest.fixture
def seeded_session(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Session:
    db_path = tmp_path / "nrf.db"
    monkeypatch.setenv("PI_DATABASE_URL", f"sqlite:///{db_path}")

    from app.db import session as session_mod

    session_mod._engine = None

    from app.models import entities  # noqa: F401

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        seed_if_empty(s)
    return Session(engine)


def test_decode_kitchen_done() -> None:
    f = build_cmd_kitchen_done_frame(seq=3, table_code=1)
    msg = decode_pic_command_binary(f)
    assert msg.command == PicIngressCommand.CMD_KITCHEN_DONE
    assert msg.table_code == 1


def test_decode_counter_lookup() -> None:
    f = build_cmd_counter_lookup_frame(seq=7, table_code=5)
    msg = decode_pic_command_binary(f)
    assert msg.command == PicIngressCommand.CMD_COUNTER_LOOKUP
    assert msg.table_code == 5


def test_decode_counter_paid() -> None:
    f = build_cmd_counter_paid_frame(seq=0, table_code=4)
    msg = decode_pic_command_binary(f)
    assert msg.command == PicIngressCommand.CMD_COUNTER_PAID
    assert msg.table_code == 4


def test_reject_wrong_length() -> None:
    with pytest.raises(PicIngressDecodeError, match="frame length"):
        decode_pic_command_binary(b"\x00" * 16)


def test_reject_bad_version() -> None:
    f = bytearray(build_cmd_kitchen_done_frame(seq=1, table_code=2))
    f[0] = 99
    with pytest.raises(PicIngressDecodeError, match="protocol version"):
        decode_pic_command_binary(bytes(f))


def test_reject_non_cmd_msg_type() -> None:
    f = bytearray(32)
    f[0] = 1
    f[1] = 0x01  # PING
    with pytest.raises(PicIngressDecodeError, match="not a PIC ingress CMD"):
        decode_pic_command_binary(bytes(f))


def test_reject_garbage_after_payload() -> None:
    f = bytearray(build_cmd_kitchen_done_frame(seq=1, table_code=3))
    f[6] = 0xFF  # padding must stay zero
    with pytest.raises(PicIngressDecodeError, match="garbage"):
        decode_pic_command_binary(bytes(f))


def test_binary_handle_kitchen_done(seeded_session: Session) -> None:
    f = build_cmd_kitchen_done_frame(seq=4, table_code=1)
    out = handle_nrf_ingress_frame(seeded_session, f)
    assert out["ack"] is True


def test_binary_handle_counter_lookup(seeded_session: Session) -> None:
    f = build_cmd_counter_lookup_frame(seq=2, table_code=5)
    out = handle_nrf_ingress_frame(seeded_session, f)
    assert out["ack"] is True
    assert out.get("total_minor") == 320_000
