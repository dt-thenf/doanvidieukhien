import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    app_name: str = "Pi Restaurant API"
    debug: bool = os.getenv("PI_DEBUG", "").lower() in ("1", "true", "yes")
    database_url: str = os.getenv("PI_DATABASE_URL", "sqlite:///./data/restaurant.db")
    cors_origins: str = os.getenv(
        "PI_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
    )


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
