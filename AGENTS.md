# Codex Instructions

## Branch Workflow

- Before starting code changes in this repository, ask whether to create a new branch to work from. If the user says yes, create and switch to that branch before editing files.

## Product Context

- Sounglah is a heritage language learning platform for diaspora families, starting with Médumba.
- It is not just a translation app. The core promise is helping children speak with parents, grandparents, and community while keeping the language alive across generations.
- Primary users are parents and children in the diaspora. Admins and reviewers support content quality later.
- Product, UI, and copy should feel warm, family-centered, child-friendly, culturally grounded, respectful, simple, and expandable to many African and local languages.
- Avoid cold generic SaaS tone and visuals. Prefer plain emotional language around family, roots, culture, preservation, and speaking with grandparents.

## Repository Layout

- `backend/` contains the Flask API. It uses `create_app`, blueprints, and pytest from the backend directory.
- `frontend/` contains the React + Vite + TypeScript + Tailwind app.
- `docs/` contains product brief, architecture, slice specs, and prompts.

## Agent Workflow

- Work in small vertical slices. Large work should be split into epics and child slices.
- Default flow is Planner, then Builder, then Reviewer, then human approval and commit.
- Implement one child slice, such as `SS###`, per chat or agent run unless the user explicitly overrides that boundary.
- At the start of slice work, confirm the single slice ID in scope. If the user did not name one, ask which `SS###` or `S###` to execute before changing files.
- Read-only exploration can reference multiple slices. Once implementation starts, narrow to one slice.
- The Planner should not ship code in the same pass as planning unless the slice is explicitly doc-only.
- Do not silently expand scope or invent API contracts. Document assumptions in the slice doc or PR when something is ambiguous.
- A slice is not done until checks pass where applicable and the slice document reflects reality.
- Update `docs/slice-board.md` and the relevant slice file when status changes, following `docs/definition-of-done.md`.
- Agent prompts live under `docs/prompts/`; product and architecture context live under `docs/`.

## General Coding Standards

- Keep diffs minimal. Do not rewrite unrelated files or introduce large abstractions early.
- Prefer existing project patterns, helpers, layouts, and components before adding new ones.
- Run the checks that exist for the area you changed before calling work complete.
- Use clear, junior-friendly code and predictable JSON APIs under the `/api` prefix.
- Push growing backend logic into services; keep route handlers thin.
- Use environment variables for secrets and config. See `.env.example` where present.

## Backend

- Backend stack: Flask with the application factory pattern.
- Routes live in blueprints under `backend/app/routes/`.
- From `backend/`, with the virtualenv active, run `pytest` for backend checks.
- On macOS, if `python` is missing, use `python3 -m venv .venv`, then `source .venv/bin/activate`.

## Frontend

- Frontend stack: React, Vite, TypeScript, and Tailwind.
- Do not add heavy UI libraries unless the team agrees.
- When touching UI, run `npm run build` and `npm run lint` from `frontend/` when those scripts exist.
- UI copy must support both English and French. When adding or changing user-facing text, update the i18n dictionaries and check both languages for layout fit, especially buttons, nav items, cards, forms, and mobile widths.
- Design tokens and utilities live in `frontend/tailwind.config.js` and `frontend/src/styles/index.css`, including utilities such as `.section`, `.card`, `.btn-primary`, and `.btn-secondary`.
- Prefer the Sounglah palette, including cream canvas, deep green CTAs, earth tones, Playfair, and Inter, over arbitrary grays or blues unless accessibility requires otherwise.
- Tailwind Sounglah colors are flat keys under `theme.extend.colors.sounglah`, such as `sounglah-cream-50`, so utilities work with `@apply` in CSS. Do not reintroduce deeply nested color objects without checking `index.css` `@apply` usage.
