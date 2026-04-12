import os
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.seed import seed_if_empty
from app.main import create_app


@pytest.fixture(name="client")
def client_fixture():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    os.environ["PI_DATABASE_URL"] = f"sqlite:///{path}"
    os.environ["PI_CORS_ORIGINS"] = ""

    from app.db import session as session_mod

    session_mod._engine = None
    engine = create_engine(
        os.environ["PI_DATABASE_URL"],
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    from app.models import entities  # noqa: F401

    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_if_empty(session)

    session_mod._engine = engine

    from app.core.config import get_settings

    app = create_app(get_settings())
    with TestClient(app) as c:
        yield c

    engine.dispose()
    session_mod._engine = None
    try:
        os.unlink(path)
    except OSError:
        pass  # Windows: file có thể còn khóa ngắn sau dispose
