from collections.abc import Generator

from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import Settings, ensure_db_parent_dir, sqlite_file_path

_engine = None


def get_engine(settings: Settings):
    global _engine
    if _engine is None:
        if settings.database_url.startswith("sqlite:///./"):
            ensure_db_parent_dir(sqlite_file_path(settings))
        connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
        _engine = create_engine(settings.database_url, echo=settings.debug, connect_args=connect_args)

        @event.listens_for(_engine, "connect")
        def _sqlite_pragma(dbapi_connection, connection_record):  # noqa: ARG001
            if settings.database_url.startswith("sqlite"):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()

    return _engine


def init_db(settings: Settings) -> None:
    from app.models import entities  # noqa: F401

    engine = get_engine(settings)
    SQLModel.metadata.create_all(engine)


def get_session(settings: Settings) -> Generator[Session, None, None]:
    engine = get_engine(settings)
    with Session(engine) as session:
        yield session
