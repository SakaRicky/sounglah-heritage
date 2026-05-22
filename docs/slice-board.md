# Sounglah Slice Board

## Current Phase

Foundation (S001) **complete**. S016 content admin stabilization is complete; next focus can move to Lessons.

Before starting Lessons implementation, use the expanded S014/S015 slice docs as the source of truth for the first lesson and lesson-item contracts. The codebase is ahead of a few older slice statuses; this board has been updated to reflect the implemented admin/auth/content surfaces verified during S016.

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
| S007 - Login page UI | Done | `/login` form UI present and consistent with the public shell. |
| S008 - Login API integration | Done | Login form submits to backend auth, stores token, handles friendly errors, and routes to `/admin`. |
| S009 - Protected admin route | Done | `ProtectedRoute` + `AdminLayout`; token check via `isAuthenticated()`. |
| S010 - Admin dashboard shell | Done | `AdminLayout`, sidebar navigation, dashboard cards, and nested admin routes exist. |

## Epic 4 - Content Admin CRUD

| Slice | Status | Notes |
|---|---|---|
| S011 - Languages CRUD | Done | Backend/frontend CRUD exists for language management and was included in S016 QA. |
| S012 - Concepts CRUD | Done | Backend/frontend CRUD exists for language-independent concepts and was included in S016 QA. |
| Unnumbered - Concept image upload with Cloudinary | Done | Backend Cloudinary upload/delete endpoints, nullable concept image fields, admin image preview/upload/remove UI, docs/env updates, and S016 build/test verification complete. |
| S013 - ConceptTexts CRUD | Done | Backend/frontend CRUD exists for English, French, Médumba, and future language text; duplicate concept/language pairs are rejected. |
| S014.1 - Concept Text Audio Data Model + Migration | Done | Adds `concept_text_audios` history model/table and nullable `concept_texts.current_audio_id`; covered by S016 QA. |
| S014.2 - Concept Text Audio Storage Service | Done | Backend validation/upload service for short concept text recordings; covered by S016 QA. |
| S014.3 - Concept Text Audio API Endpoints | Done | Upload, history, review queue, approve, and reject endpoints; covered by S016 QA. |
| S014.4 - Concept Text Table Audio Summary | Done | Concept Texts list includes page-level `audioSummary`/`audio_summary`; table displays missing, pending, approved, and rejected audio states without per-row history requests. |
| S014.5 - Inline Audio Recorder Component | Done | Reusable browser recorder wired into missing/rejected Concept Text table rows; local preview/retake/cancel before multipart submit for review. |
| S014.6 - Concept Text Audio Cell | Done | Reusable audio cell handles missing, pending, approved, and rejected states with Médumba-only record/replace actions in the Concept Texts table. |
| S014.7 - Mini Audio Player | Done | Compact reusable audio player with play/pause, loading, duration, and error states; used in the Concept Text audio cell and recorder preview. |
| S014.8 - Recording Mode Page | Done | Focused batch recording page at `/admin/content/concept-texts/recording`; loads missing Médumba items, advances after submit, and promotes the active phrase as the primary recording target. |
| S014.9 - Audio Review Queue | Done | Admin review queue at `/admin/audio-review` lists submitted audio, puts the reviewed phrase first on mobile and desktop, and supports approve/reject with review notes. |
| S014.10 - Permissions and Roles | Done | MVP admin-only audio permission gates are centralized on backend and frontend; role-specific behavior is deferred until roles exist. |
| S016 - Content Admin Stabilization + QA | Done | Focused pre-Lessons QA pass for Languages, Concepts, Concept Texts, audio review, seed sanity, and build readiness. Manual QA, backend tests, frontend lint, and frontend build pass when using the repo-pinned Node 22.15.0 through nvm. |
| S014 - Lessons CRUD | Planned | Lesson structure; contract expanded before implementation. Note: this ID predates the audio S014.x child slices and remains the lessons slice used by existing admin placeholders. |
| S015 - LessonItems CRUD | Planned | Exercises/items; contract expanded before implementation, including concept-backed vocabulary cards and concept-less story segments. |
| S021 - Concept Completion Workflow | Done | Admin completion dashboard at `/admin/content/concepts/completion`, required-language flags, heritage review gating, guarded publish, and backend/frontend verification complete. See `docs/slices/E04-content-admin/S021-concept-completion-workflow.md`. |
| S021.1 - Required Language Flag | Done | Adds `languages.is_required_for_concept_completion`, seeds English/French/Médumba as required, exposes the flag through language API/admin UI, and passes backend tests plus frontend lint/build. |
| S021.2 - Concept Text Rejected Review Status | Done | Adds `rejected` to concept text review status across backend validation/constraint, frontend form/filter/badges, API docs, and tests. |
| S021.3 - Concept Published State And Publish Guard | Done | Adds `concepts.published_at`, exposes publish state in concept API responses, and guards `POST /api/admin/concepts/:id/publish` with centralized completion logic. |
| S021.4 - Completion Calculation Service | Done | Centralizes concept completion status calculation for required languages, active concept texts, rejected/draft/review states, complete, and published readiness; backend tests pass. |
| S021.5 - Completion API Endpoints | Done | Adds authenticated completion list and summary endpoints with status, required-language, search, and pagination filters; focused concept tests pass. |
| S021.6 - Admin Route And Dashboard Shell | Done | Adds the protected Concept Completion admin route, sidebar link, frontend API client/types, and loading/error/empty dashboard shell; frontend lint/build pass. |
| S021.7 - Completion Table And Mobile Cards | Done | Six status summary cards, filters, desktop table with per-language badges, mobile stacked cards, and Concepts sub-nav tabs; frontend lint/build pass. |
| S021.8 - Quick Actions And Publish UI | Done | Per-language quick links into Concept Texts, publish button with disabled reasons for incomplete concepts, and deep-link support for prefilled create/edit forms; frontend lint/build pass. |
| S021.9 - Workflow Tests And Stabilization | Done | Pins test admin credentials for reliable pytest, adds summary auth and rejected-text publish guard coverage, runs full backend/frontend checks, and marks S021 complete. |
| S022 - Text Review Queue | Planned | Dedicated local-language text review at `/admin/text-review` (Médumba + future Duala/Fefe/Bassa); one-click reject; EN/FR reference only, never queue rows. See `docs/slices/E04-content-admin/S022-text-review-queue.md`. |
| S022.1 - Text Review Queue API | Done | `GET /api/admin/concept-texts/review-queue` — local-language filter, FIFO ordering, EN/FR reference texts; six backend tests pass. |
| S022.2 - Text Review Page Shell | Planned | Protected route, sidebar link, API client, header, and loading/empty/error states. |
| S022.3 - Review Table And Mobile Cards | Planned | Phrase-first desktop table and mobile cards with filters and pagination. |
| S022.4 - Approve, Reject, And Edit Actions | Planned | One-click approve/reject via concept text update; edit deep link to Concept Texts. |
| S022.5 - Tests, Docs, And Stabilization | Planned | Backend tests, frontend lint/build, API docs, slice board update. |

## Epic 5 - Learner Experience

| Slice | Status | Notes |
|---|---|---|
| S017 - Learner lesson shell | Backlog | Public/learner lesson layout |
| S018 - First lesson flow | Backlog | Simple family-centered lesson |
| S019 - Exercise interaction | Backlog | Basic practice interaction |

## Epic 6 - Quality + Regression Coverage

| Slice | Status | Notes |
|---|---|---|
| S020 - Playwright E2E Testing Setup | Done | Frontend Playwright setup with public experience smoke coverage; lint, build, and E2E checks pass per slice doc. |
