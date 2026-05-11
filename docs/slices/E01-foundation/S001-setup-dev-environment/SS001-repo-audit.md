# SS001 - Repo Audit

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Completion

- Reviewer approved this slice.
- Repository folder **`api/`** was renamed to **`backend/`** so the tree matches `docs/architecture-notes.md` and root **README.md** (`cd backend`). HTTP routes still use the **`/api`** prefix (e.g. `GET /api/health/`); only the on-disk package directory name changed.

## Goal

Inspect the current repo and understand what already exists before making changes.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Scope:** Inventory repo layout, stack alignment with `docs/project-brief.md` and `docs/architecture-notes.md`, and how far the tree already goes beyond “setup” slices. No feature work.
- **Assumptions:** Child slices SS002–SS008 describe an incremental bootstrap; this repo already contains many of those outcomes. Later slices should be treated as **verify / align / document** unless you intentionally reset the tree.
- **Risks (at audit time):** Docs referred to `backend/` while the Flask app lived under `api/`. **Resolved:** rename to `backend/` (see Completion).
- **Out of scope for SS001:** Running full `pytest` / `npm run build` in a clean environment (tracked under SS008). A quick check showed system Python had no `pytest`; dependencies are expected inside a venv after `pip install -r requirements.txt`.

## Audit Findings (Current State)

### Layout (root)

| Path | Role |
|------|------|
| `backend/` | Flask application (`create_app`, blueprints, `run.py`, `requirements.txt`, `tests/`) |
| `frontend/` | Vite + React + TypeScript app (`package.json`, Tailwind/PostCSS configs, `src/`) |
| `docs/` | Product brief, architecture, slice board, agent system, prompts, slice specs |
| `.cursor/rules/` | `agent-workflow.mdc`, `coding-standards.mdc`, `sounglah-product.mdc` (Cursor rules) |
| `.env.example` | Env template at repo root |

### Backend (`backend/`)

- **Pattern:** Application factory in `app/__init__.py`, blueprint registration, `flask_cors`.
- **Health API:** `GET /api/health/` → JSON `status: ok`, `service: sounglah-api` (`app/routes/health_routes.py`).
- **Tests:** `backend/tests/test_health.py` exercises the health route via Flask test client.
- **Placeholder dirs:** `app/models/`, `schemas/`, `services/`, `utils/` exist (per README structure); no extra route modules beyond health in the audited file set.

### Frontend (`frontend/`)

- **Stack:** React, Vite, TypeScript, ESLint, Tailwind + PostCSS (see `package.json`, `tailwind.config.js`).
- **Routing / UI:** The tree already includes public layout, landing, login page, admin layout, dashboard, and placeholder admin routes (languages, concepts, lessons), plus `src/lib/api.ts` and `src/lib/auth.ts` — i.e. **work that maps to later epics (E02–E04)** is present ahead of formal slice completion on the board.

### Documentation vs code

- **README.md** and **backend/README.md** use `cd backend`; code lives under **`backend/`** — aligned.
- **`docs/architecture-notes.md`** describes `backend/` and `frontend/` — matches the repo.

### Slice board alignment

- **`docs/slice-board.md`** lists E01–E05 slices as Backlog; the codebase is **ahead** of that board for several areas (public shell, login UI, admin shell scaffolding). After S001, consider updating the board to reflect reality or consciously defer UI until slices are executed.

## Builder Handoff (SS002 — Create base folder structure)

1. **Folder naming:** ~~Resolve `api/` vs `backend/`~~ **Done** (backend folder name matches docs).
2. **SS002 scope guard:** Do not add features. Confirm any remaining path references in docs or tooling, empty package keepers if needed, and consistency with `docs/slices/.../SS002-create-folder-structure.md` only.
3. **Do not duplicate** SS003–SS007 implementation work unless audit shows a gap; most of that is already present — SS002 is structural and naming clarity.

## Acceptance Criteria

- [x] Scope is clear (audit only; no unrelated code changes required for SS001).
- [x] Changes are minimal (this slice’s deliverable is documentation and status updates).
- [x] The slice can be reviewed independently (findings and SS002 handoff above).

## Test / Manual Checks

| Check | Result / note |
|-------|----------------|
| Repo tree matches mental model of monorepo | Yes: `backend` + `frontend` + `docs` + `.cursor` |
| Health route path | `GET /api/health/` implemented and covered by test file |
| `pytest` on host Python | Not run (no `pytest` on bare `python3`); run under venv in SS008 |
| `npm install` / `npm run build` | Not run (`frontend/node_modules` absent); SS008 |

## Reviewer Checklist

- [x] Confirm audit findings match local tree (`backend/` + `frontend/`).
- [x] Approve naming decision (`backend/` for Flask app root).
- [x] SS001 **Status** set to **Done**; proceed to SS002.
