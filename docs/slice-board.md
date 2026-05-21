# Sounglah Slice Board

## Current Phase

Foundation (S001) **complete**. Next: pick the next epic slice from the board (for example E02+ refinements or E03 auth).

## Rules

- One slice at a time; **one child slice (SS###) per Cursor chat or agent run** (see **`docs/agent-system.md`** and **`.cursor/rules/agent-workflow.mdc`**).
- Every slice must have a Planner handoff.
- Every slice must pass Reviewer approval before commit.
- Big slices must be split.
- Schema can evolve through migrations; do not over-design too early.
- Parent slices with child slices should have a folder and a `00-overview.md`.

## Documentation index

See **[docs/README.md](./README.md)** for a map of all core docs.

## Status Legend

- Backlog
- Planned
- Building
- Review
- Done
- Blocked

## Epic 1 - Project Foundation

| Slice | Status | Notes |
|---|---|---|
| S001 - Setup dev environment | Done | All child slices SS001–SS008 complete; backend `pytest` + frontend `build`/`lint` verified (see SS008). |
| S002 - Project documentation setup | Done | `project-brief`, `architecture-notes`, `product-decisions`, `agent-system`, `definition-of-done`, **docs/README.md** index. |
| S003 - Cursor rules setup | Done | `.cursor/rules/*.mdc` (see SS006 under S001). |

## Epic 2 - Public Experience

| Slice | Status | Notes |
|---|---|---|
| S004 - Public app shell | Done | `PublicLayout`, `Navbar`, `Footer`, React Router shell in `frontend/`. |
| S005 - Landing page | Done | Marketing landing sections and hero in `LandingPage.tsx`; public UI i18n now supports English/French with navbar language switching. |
| SS009 - Explore languages section (S005) | Done | Horizontal explore strip, `/languages` stub, shared `content/languages.ts` (see `docs/slices/E02-public-experience/SS009-explore-languages-section.md`). |
| SS010 - Middle feature band (S005) | Done | Mint band, three cards (continue / stories / daily goal), shared `content/stories.ts` (see `docs/slices/E02-public-experience/SS010-middle-feature-band.md`). |
| S006 - Login CTA from navbar | Done | Nav links to `/login`. |

## Epic 3 - Authentication + Admin Shell

| Slice | Status | Notes |
|---|---|---|
| S007 - Login page UI | Review | `/login` form UI present; wire-up / validation in later slices. |
| S008 - Login API integration | Backlog | Token/session + backend auth. |
| S009 - Protected admin route | Done | `ProtectedRoute` + `AdminLayout`; token check via `isAuthenticated()`. |
| S010 - Admin dashboard shell | Backlog | `AdminLayout` exists but router currently mounts only `/admin` dashboard stub; wire layout + nested routes when ready. |

## Epic 4 - Content Admin CRUD

| Slice | Status | Notes |
|---|---|---|
| S011 - Languages CRUD | Backlog | First backend/frontend CRUD |
| S012 - Concepts CRUD | Backlog | Core learning concepts |
| Unnumbered - Concept image upload with Cloudinary | Done | Backend Cloudinary upload/delete endpoints, nullable concept image fields, admin image preview/upload/remove UI, docs/env updates, backend tests passing; frontend typecheck and JSON lint pass, build blocked locally by Node 20.10.0 below Vite requirement. |
| S013 - ConceptTexts CRUD | Backlog | English/French/Médumba text |
| S014.1 - Concept Text Audio Data Model + Migration | Review | Adds `concept_text_audios` history model/table and nullable `concept_texts.current_audio_id`; backend tests passing. |
| S014.2 - Concept Text Audio Storage Service | Review | Backend validation/upload service for short concept text recordings; backend tests passing. |
| S014.3 - Concept Text Audio API Endpoints | Review | Upload, history, review queue, approve, and reject endpoints; backend tests passing. |
| S014 - Lessons CRUD | Backlog | Lesson structure |
| S015 - LessonItems CRUD | Backlog | Exercises/items |

## Epic 5 - Learner Experience

| Slice | Status | Notes |
|---|---|---|
| S016 - Learner lesson shell | Backlog | Public/learner lesson layout |
| S017 - First lesson flow | Backlog | Simple family-centered lesson |
| S018 - Exercise interaction | Backlog | Basic practice interaction |
