import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
_REPO_ROOT = _BACKEND_ROOT.parent


def _resolve_local_media_root(value: Optional[str]) -> str:
    if not value:
        return str(_REPO_ROOT / "media")

    path = Path(value)
    if path.is_absolute():
        return str(path.resolve())

    return str((_BACKEND_ROOT / path).resolve())


def _default_media_storage_provider():
    flask_env = os.getenv("FLASK_ENV", "development").strip().lower()
    return "cloudinary" if flask_env == "production" else "local"


def _database_uri_from_env() -> str:
    database_url = os.getenv("DATABASE_URL", "sqlite:///sounglah.db")

    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)

    return database_url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = _database_uri_from_env()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@sounglah.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    CLOUDINARY_UPLOAD_ROOT = os.getenv("CLOUDINARY_UPLOAD_ROOT", "sounglah/dev")
    MEDIA_STORAGE_PROVIDER = os.getenv("MEDIA_STORAGE_PROVIDER", _default_media_storage_provider())
    LOCAL_MEDIA_ROOT = _resolve_local_media_root(os.getenv("LOCAL_MEDIA_ROOT"))
    LOCAL_MEDIA_URL_PREFIX = os.getenv("LOCAL_MEDIA_URL_PREFIX", "/media")
    MAX_IMAGE_UPLOAD_MB = int(os.getenv("MAX_IMAGE_UPLOAD_MB", "5"))
    MAX_AUDIO_UPLOAD_MB = int(os.getenv("MAX_AUDIO_UPLOAD_MB", "5"))
    MAX_AUDIO_DURATION_SECONDS = int(os.getenv("MAX_AUDIO_DURATION_SECONDS", "30"))
