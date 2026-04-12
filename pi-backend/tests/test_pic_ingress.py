"""Ingress PIC → domain (không qua HTTP)."""

from __future__ import annotations

from pathlib import Path

import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.seed import seed_if_empty
from app.services.pic_ingress import (
    PicIngressCommand,
    PicIngressDecodeError,
    PicIngressIn,
    decode_pic_command_json,
    handle_pic_ingress,
)


@pytest.fixture
def seeded_session(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Session:
    db_path = tmp_path / "ingress.db"
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


def test_decode_json_minimal() -> None:
    msg = decode_pic_command_json('{"cmd":"CMD_KITCHEN_DONE","table_code":6}')
    assert msg.command == PicIngressCommand.CMD_KITCHEN_DONE
    assert msg.table_code == 6


def test_decode_json_aliases() -> None:
    msg = decode_pic_command_json(
        '{"command":"CMD_COUNTER_LOOKUP","table_id":5}',
    )
    assert msg.command == PicIngressCommand.CMD_COUNTER_LOOKUP
    assert msg.table_code == 5


def test_decode_unknown_command() -> None:
    with pytest.raises(PicIngressDecodeError, match="unknown cmd"):
        decode_pic_command_json('{"cmd":"CMD_FOO","table_code":1}')


def test_decode_missing_table() -> None:
    with pytest.raises(PicIngressDecodeError, match="missing table"):
        decode_pic_command_json('{"cmd":"CMD_KITCHEN_DONE"}')


def test_decode_bytes_utf8() -> None:
    raw = '{"cmd":"CMD_COUNTER_PAID","table_code":5}'.encode()
    msg = decode_pic_command_json(raw)
    assert msg.command == PicIngressCommand.CMD_COUNTER_PAID


def test_handle_kitchen_done_maps_to_apply(seeded_session: Session) -> None:
    """Bàn 01 seed: đơn IN_KITCHEN."""
    out = handle_pic_ingress(
        seeded_session,
        PicIngressIn(command=PicIngressCommand.CMD_KITCHEN_DONE, table_code=1),
    )
    assert out["ack"] is True
    assert out["status"] == "DONE"


def test_handle_kitchen_done_idempotent(seeded_session: Session) -> None:
    h = PicIngressIn(command=PicIngressCommand.CMD_KITCHEN_DONE, table_code=1)
    assert handle_pic_ingress(seeded_session, h)["ack"] is True
    out2 = handle_pic_ingress(seeded_session, h)
    assert out2["ack"] is True
    assert out2.get("idempotent") is True


def test_handle_kitchen_done_no_active_order(seeded_session: Session) -> None:
    out = handle_pic_ingress(
        seeded_session,
        PicIngressIn(command=PicIngressCommand.CMD_KITCHEN_DONE, table_code=6),
    )
    assert out["ack"] is False
    assert out.get("err") == "NO_ACTIVE_ORDER"


def test_handle_kitchen_done_table_not_found(seeded_session: Session) -> None:
    out = handle_pic_ingress(
        seeded_session,
        PicIngressIn(command=PicIngressCommand.CMD_KITCHEN_DONE, table_code=999),
    )
    assert out["ack"] is False
    assert out.get("err") == "TABLE_NOT_FOUND"


def test_handle_counter_lookup(seeded_session: Session) -> None:
    out = handle_pic_ingress(
        seeded_session,
        PicIngressIn(command=PicIngressCommand.CMD_COUNTER_LOOKUP, table_code=5),
    )
    assert out["ack"] is True
    assert out.get("total_minor") == 320_000
    assert out.get("payment_state") == "REQUESTED"


def test_handle_counter_paid_invalid_payment_not_requested(seeded_session: Session) -> None:
    """Bàn 04: đơn IN_KITCHEN, chưa có payment REQUESTED."""
    out = handle_pic_ingress(
        seeded_session,
        PicIngressIn(command=PicIngressCommand.CMD_COUNTER_PAID, table_code=4),
    )
    assert out["ack"] is False
    assert out.get("err") == "PAYMENT_NOT_REQUESTED"


def test_handle_counter_paid_happy_then_idempotent(seeded_session: Session) -> None:
    msg = PicIngressIn(command=PicIngressCommand.CMD_COUNTER_PAID, table_code=5)
    out = handle_pic_ingress(seeded_session, msg)
    assert out["ack"] is True
    assert out.get("payment") == "PAID"
    out2 = handle_pic_ingress(seeded_session, msg)
    assert out2["ack"] is True
    assert out2.get("idempotent") is True


def test_json_to_handle_roundtrip(seeded_session: Session) -> None:
    raw = b'{"cmd":"CMD_COUNTER_LOOKUP","table_code":5}'
    msg = decode_pic_command_json(raw)
    out = handle_pic_ingress(seeded_session, msg)
    assert out["ack"] is True
