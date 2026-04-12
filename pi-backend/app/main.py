from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.api.v1.router import api_router
from app.core.config import Settings, get_settings
from app.db.seed import seed_if_empty
from app.db.session import get_engine, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    init_db(settings)
    engine = get_engine(settings)
    with Session(engine) as session:
        seed_if_empty(session)
    yield


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
    )
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api/v1")
    if settings.debug:
        from app.api.v1 import dev as dev_api

        app.include_router(dev_api.router, prefix="/api/v1")
    return app


app = create_app()
