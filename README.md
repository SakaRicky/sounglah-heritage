# Sounglah Starter

Sounglah is a heritage language learning platform for diaspora families, starting with Médumba.

This starter gives you:
- A Flask backend structure
- A React + Vite + TypeScript + Tailwind frontend structure
- Cursor rules
- Agent prompts
- Slice board
- Definition of done
- A first parent slice for setting up the development environment

## Product Direction

Sounglah is not just a translation app. It is a warm, child-friendly, family-centered learning platform that helps diaspora children learn their heritage language and stay connected to parents, grandparents, culture, and roots.

## Suggested First Work Order

1. Open this repo in Cursor.
2. Skim `docs/README.md` for a map of all documentation, then read `docs/project-brief.md`.
3. Read `docs/agent-system.md`.
4. Read `docs/slice-board.md`.
5. Open `docs/slices/E01-foundation/S001-setup-dev-environment/00-overview.md` for setup child slices.
6. Use the Planner prompt before coding.
7. Use the Builder prompt to implement one child slice.
8. Use the Reviewer prompt before committing.

## Repository layout

```text
backend/     Flask API (application factory, blueprints, tests)
frontend/    React + Vite + TypeScript + Tailwind
docs/        Documentation index (README.md), brief, architecture, slices, prompts
.cursor/     Cursor rules (`rules/*.mdc`) for product, coding, and agent workflow
```

## Local Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app run.py db upgrade
flask --app run.py seed
python run.py
```

On macOS, the `python` command is often missing until a venv is active; use **`python3 -m venv .venv`** to create the environment. After `source .venv/bin/activate`, `python run.py` is fine.

Health check:

```bash
curl http://127.0.0.1:5000/api/health/
```

Run tests (from `backend/` with venv active):

```bash
cd backend
source .venv/bin/activate
pytest
```

Apply database migrations after pulling schema changes:

```bash
cd backend
source .venv/bin/activate
flask --app run.py db upgrade
flask --app run.py seed
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Verify production build and lint:

```bash
cd frontend
npm run build
npm run lint
```

### Quick verification (CI-style)

From the repository root, after a clean checkout (or when sanity-checking):

```bash
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && flask --app run.py db upgrade && flask --app run.py seed && pytest
cd ../frontend && npm install && npm run build && npm run lint
```

Use **`npm ci`** instead of **`npm install`** when `package-lock.json` is present and you want a reproducible install (for example in CI).

## Recommended Agent Flow

```text
Planner → Builder → Reviewer → Human approval → Commit
```

Do not ask one agent to build a large feature in one pass. Work in slices.
