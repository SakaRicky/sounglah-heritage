from app.config import _database_uri_from_env


def test_database_url_uses_installed_psycopg_driver(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@example.com:5432/sounglah")

    assert (
        _database_uri_from_env()
        == "postgresql+psycopg://user:pass@example.com:5432/sounglah"
    )


def test_railway_legacy_postgres_url_uses_installed_psycopg_driver(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://user:pass@example.com:5432/sounglah")

    assert (
        _database_uri_from_env()
        == "postgresql+psycopg://user:pass@example.com:5432/sounglah"
    )


def test_non_postgres_database_url_is_unchanged(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite:///sounglah.db")

    assert _database_uri_from_env() == "sqlite:///sounglah.db"
