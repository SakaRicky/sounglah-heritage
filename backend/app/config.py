import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _default_media_storage_provider():
    flask_env = os.getenv("FLASK_ENV", "development").strip().lower()
    return "cloudinary" if flask_env == "production" else "local"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///sounglah.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@sounglah.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    CLOUDINARY_UPLOAD_ROOT = os.getenv("CLOUDINARY_UPLOAD_ROOT", "sounglah/dev")
    MEDIA_STORAGE_PROVIDER = os.getenv("MEDIA_STORAGE_PROVIDER", _default_media_storage_provider())
    LOCAL_MEDIA_ROOT = os.getenv(
        "LOCAL_MEDIA_ROOT",
        str(Path(__file__).resolve().parents[2] / "media"),
    )
    LOCAL_MEDIA_URL_PREFIX = os.getenv("LOCAL_MEDIA_URL_PREFIX", "/media")
    MAX_IMAGE_UPLOAD_MB = int(os.getenv("MAX_IMAGE_UPLOAD_MB", "5"))
    MAX_AUDIO_UPLOAD_MB = int(os.getenv("MAX_AUDIO_UPLOAD_MB", "5"))
    MAX_AUDIO_DURATION_SECONDS = int(os.getenv("MAX_AUDIO_DURATION_SECONDS", "30"))
