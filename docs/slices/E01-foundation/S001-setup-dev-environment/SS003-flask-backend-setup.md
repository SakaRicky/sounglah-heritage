# SS003 - Flask Backend Setup

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Goal

Create a minimal Flask API with application factory pattern and health endpoint.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Existing implementation:** `create_app()` in `backend/app/__init__.py`, `Config` in `backend/app/config.py`, health blueprint at `/api/health/`, `backend/run.py` entrypoint — already matches architecture notes.
- **Scope for SS003:** Confirm the app boots and `GET /api/health/` returns success; no feature additions unless something blocks startup.

## Builder Summary (Completed)

- Reviewed application factory, CORS, health blueprint registration (`url_prefix="/api/health"`), and `run.py`.
- **Smoke test:** With venv and dependencies installed, ran `python run.py`, requested `http://127.0.0.1:5000/api/health/`, received **HTTP 200** and JSON `{"status": "ok", "service": "sounglah-api"}`.

## How you can verify locally

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

If `python3` is not available, install Python 3 from [python.org](https://www.python.org/downloads/) or your OS package manager. On macOS, `python` alone is often missing; **`python3 -m venv .venv`** avoids `command not found: python` when creating the venv.

In another terminal:

```bash
curl http://127.0.0.1:5000/api/health/
```

You should see JSON with `status` and `service`. **Ctrl+C** stops the server.

## Acceptance Criteria

- [x] Minimal Flask API uses an application factory.
- [x] Health endpoint is registered under `/api/health/`.
- [x] `python run.py` starts the development server successfully.

## Test / Manual Checks

| Check | Result |
|-------|--------|
| `pytest` (from `backend/` with venv) | Pass (from SS002 `pytest.ini`) |
| `python run.py` + `GET /api/health/` | 200, expected JSON |

## Suggested commit message

```text
docs(slices): complete SS003 Flask backend setup verification

Health API and factory were already in place; document verification
and mark slice done after successful local server smoke test.
```
