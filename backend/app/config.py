import os


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///sounglah.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@sounglah.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")
