# SS008 - Verify Dev Commands

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Goal

Verify backend and frontend install/run/build commands and document issues.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Checks:** Match `docs/definition-of-done.md` — backend `pytest` from `backend/` with venv; frontend `npm run build` and `npm run lint` from `frontend/`.
- **Docs:** Record results in this slice; surface one-shot verification in root `README.md` if missing.

## Builder Summary (Completed)

- **Backend:** `python3 -m venv .venv` → `source .venv/bin/activate` → `pip install -r requirements.txt` → **`pytest -q`** → **1 passed** (health test).
- **Frontend:** **`npm install`** → **`npm run build`** → **`npm run lint`** → all succeeded (no ESLint issues).
- **README:** Added **Quick verification (CI-style)** with chained commands and note to prefer **`npm ci`** when using lockfile in CI.

## Command reference

| Area | Command | When |
|------|---------|------|
| Backend server | `cd backend && source .venv/bin/activate && python run.py` | Local dev |
| Backend tests | `cd backend && source .venv/bin/activate && pytest` | After backend changes |
| Health | `curl http://127.0.0.1:5000/api/health/` | With server running |
| Frontend dev | `cd frontend && npm run dev` | Local UI |
| Frontend build | `cd frontend && npm run build` | Before merge / CI |
| Frontend lint | `cd frontend && npm run lint` | Before merge / CI |

## Known notes

- **macOS:** Use `python3 -m venv .venv` if `python` is not on `PATH` (see root README).
- **pip:** System message may suggest upgrading pip inside the venv; optional.

## Acceptance Criteria

- [x] Backend test command verified on a fresh-enough venv.
- [x] Frontend build and lint verified.
- [x] Commands documented for humans and CI (`README.md` + this file).

## Test / Manual Checks

| Check | Result |
|-------|--------|
| `pytest` in `backend/` | Pass (1 test) |
| `npm run build` in `frontend/` | Pass |
| `npm run lint` in `frontend/` | Pass |

## Suggested commit message

```text
docs(slices): complete SS008 dev command verification

Record pytest/build/lint results; add README quick verification block
and npm ci note for CI.
```
