from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.db.session import get_engine
from app.services.pic_bridge import StubPicBridge, get_pic_bridge


def get_settings_dep() -> Settings:
    return get_settings()


def get_db_session(
    settings: Annotated[Settings, Depends(get_settings_dep)],
) -> Generator[Session, None, None]:
    engine = get_engine(settings)
    with Session(engine) as session:
        yield session


def get_bridge_dep() -> StubPicBridge:
    return get_pic_bridge()
