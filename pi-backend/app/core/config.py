import os
from dataclasses import dataclass, field
from pathlib import Path

_DEFAULT_CORS = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174"
)


def _env_debug() -> bool:
    return os.getenv("PI_DEBUG", "").lower() in ("1", "true", "yes")


def _env_database_url() -> str:
    return os.getenv("PI_DATABASE_URL", "sqlite:///./data/restaurant.db")


def _env_cors_origins() -> str:
    return os.getenv("PI_CORS_ORIGINS", _DEFAULT_CORS)


@dataclass(frozen=True)
class Settings:
    """Đọc biến môi trường lúc **tạo instance** (không cache lúc import module)."""

    app_name: str = "Pi Restaurant API"
    debug: bool = field(default_factory=_env_debug)
    database_url: str = field(default_factory=_env_database_url)
    cors_origins: str = field(default_factory=_env_cors_origins)


def get_settings() -> Settings:
    return Settings()


def sqlite_file_path(settings: Settings) -> Path:
    """Trả về path file .db khi dùng sqlite:///."""
    raw = settings.database_url
    if not raw.startswith("sqlite:///./"):
        return Path("restaurant.db")
    return Path(raw.replace("sqlite:///./", ""))


def ensure_db_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
