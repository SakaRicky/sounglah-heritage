# SS002 - Create Base Folder Structure

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Goal

Create the base monorepo folder structure for backend, frontend, docs, slices, and Cursor rules.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Context:** SS001 confirmed `backend/`, `frontend/`, `docs/`, `.cursor/rules/`, and nested `docs/slices/...` already exist and match the intended monorepo.
- **Scope:** Verify layout against `docs/architecture-notes.md`, fix contributor-facing path/docs gaps, ensure backend tests are runnable from `backend/` without import hacks.
- **Assumption:** No rename of `backend/` in this slice (already aligned in SS001).

## Builder Summary (Completed)

- Confirmed on-disk layout: `backend/app/` (`routes`, `models`, `schemas`, `services`, `utils` with `__init__.py`), `backend/tests/`, `frontend/src/` (`app`, `components`, `lib`, `pages`, `styles`), `docs/`, `.cursor/rules/`.
- Added **`backend/pytest.ini`** with `pythonpath = .` and `testpaths = tests` so `pytest` resolves the `app` package when run from `backend/`.
- Documented monorepo tree in **root `README.md`**, clarified **backend `README.md`** (repo root vs already in `backend/`), added **pytest** to root README.
- Updated **`docs/definition-of-done.md`** so minimum commands explicitly use `cd backend` / `cd frontend`.

## Acceptance Criteria

- [x] Scope is clear (structure + docs + pytest discovery only).
- [x] Changes are minimal.
- [x] The slice can be reviewed independently.

## Test / Manual Checks

| Check | Result |
|-------|--------|
| `cd backend && source .venv/bin/activate && pytest` | Pass (1 test), after `pytest.ini` |
| Repo matches documented top-level layout | `backend/`, `frontend/`, `docs/`, `.cursor/` |

## Suggested commit message

```text
fix(backend): add pytest.ini and document monorepo layout (SS002)

Ensure pytest resolves the Flask app package from backend/; document
repository layout and cd paths in README and definition-of-done.
```
