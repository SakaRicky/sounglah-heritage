# Sounglah Backend

Flask API for Sounglah.

## Setup

From the **repository root** (parent of `backend/`):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app run.py db upgrade
flask --app run.py seed
python run.py
```

If you are already inside `backend/`, run the `python3` / `pip` / `flask` / `python` lines only (skip `cd backend`).

On many Macs, `python` is not on your PATH until the venv is activated; use **`python3 -m venv .venv`** the first time.

## Health Check

```bash
curl http://127.0.0.1:5000/api/health/
```

## Tests

With the virtualenv activated:

```bash
pytest
```

## Database Migrations

Schema changes are managed with Flask-Migrate/Alembic. Do not rely on application startup to create or alter development tables.

Apply migrations:

```bash
flask --app run.py db upgrade
```

Generate a migration after model changes:

```bash
flask --app run.py db migrate -m "describe change"
```

Seed local admin data and starter languages:

```bash
flask --app run.py seed
```

## Structure

```text
app/
  __init__.py
  config.py
  extensions.py
  routes/
  models/
  schemas/
  services/
  utils/
tests/
migrations/
pytest.ini
run.py
requirements.txt
```
