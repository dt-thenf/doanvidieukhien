"""Route /dev chỉ mount khi PI_DEBUG=1."""

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.seed import seed_if_empty


def test_dev_kitchen_done_not_available_when_debug_off(client):
    r = client.post("/api/v1/dev/tables/1/kitchen-done")
    assert r.status_code == 404


def test_dev_counter_paid_not_available_when_debug_off(client):
    r = client.post("/api/v1/dev/tables/1/counter-paid")
    assert r.status_code == 404


def test_dev_kitchen_done_when_debug_on(monkeypatch, tmp_path: Path):
    db_path = tmp_path / "dev.db"
    monkeypatch.setenv("PI_DEBUG", "1")
    monkeypatch.setenv("PI_DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("PI_CORS_ORIGINS", "")

    from app.db import session as session_mod

    session_mod._engine = None

    from app.models import entities  # noqa: F401

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_if_empty(session)
    session_mod._engine = engine

    from app.core.config import get_settings
    from app.main import create_app

    app = create_app(get_settings())
    try:
        with TestClient(app) as c:
            r = c.post("/api/v1/dev/tables/1/kitchen-done")
            assert r.status_code == 200
            body = r.json()
            assert body.get("ack") is True
            assert body.get("status") == "DONE"
    finally:
        engine.dispose()
        session_mod._engine = None


def test_dev_counter_paid_when_debug_on(monkeypatch, tmp_path: Path):
    """Luồng rút gọn: đơn → kitchen-done → payment/request → counter-paid (giả PIC quầy)."""
    db_path = tmp_path / "dev2.db"
    monkeypatch.setenv("PI_DEBUG", "1")
    monkeypatch.setenv("PI_DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("PI_CORS_ORIGINS", "")

    from app.db import session as session_mod

    session_mod._engine = None

    from app.models import entities  # noqa: F401

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_if_empty(session)
    session_mod._engine = engine

    from app.core.config import get_settings
    from app.main import create_app

    app = create_app(get_settings())
    order_body = {
        "lines": [{"menuItemId": "canh-rau", "quantity": 1, "lineNote": ""}],
        "orderNote": "",
    }
    try:
        with TestClient(app) as c:
            assert c.post("/api/v1/customer/tables/6/orders/active", json=order_body).status_code == 200
            assert c.post("/api/v1/dev/tables/6/kitchen-done").status_code == 200
            assert c.post("/api/v1/customer/tables/6/payment/request").status_code == 200
            r = c.post("/api/v1/dev/tables/6/counter-paid")
            assert r.status_code == 200
            body = r.json()
            assert body.get("ack") is True
            assert body.get("payment") == "PAID"
            r2 = c.post("/api/v1/dev/tables/6/counter-paid")
            assert r2.status_code == 200
            assert r2.json().get("idempotent") is True
    finally:
        engine.dispose()
        session_mod._engine = None
