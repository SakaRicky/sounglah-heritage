# Sounglah Slice Board

## Current Phase

Foundation (S001) **complete**. S016 content admin stabilization and S021 concept completion are complete. **Epic 5 — S023 Lessons MVP in progress.** **S023.1–S023.7** are **Done**; **next: S023.8** (public lessons API + listing).

Use **`docs/slices/E05-lessons/00-overview.md`** and child slices **S023.1–S023.15** as the source of truth for lessons work. Epic is **implementation-ready**; product decisions locked (anonymous public API, nested item admin, publish guards). Prerequisite: curated published concepts with approved Médumba texts and audio before seeding **Greeting Grandma** (S023.15).

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
| S014 - Lessons CRUD | Superseded | **Use S023 instead.** Historical E04 draft; admin placeholders at `/admin/content/lessons` remain until S023.3. ID predates audio S014.x child slices. |
| S015 - LessonItems CRUD | Superseded | **Use S023 instead.** Historical E04 draft used seed types `vocabulary_card` / `story_segment`; MVP uses VOCABULARY, PHRASE, AUDIO_LISTEN, CULTURAL_NOTE. |
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
| S022 - Text Review Queue | Done | Local-language text review at `/admin/content/concept-texts/review` (Concept Texts tab); queue API, filters, phrase-first table/cards, one-click approve/reject, edit deep links. |
| S022.1 - Text Review Queue API | Done | `GET /api/admin/concept-texts/review-queue` — local-language filter, FIFO ordering, EN/FR reference texts; six backend tests pass. |
| S022.2 - Text Review Page Shell | Done | Protected `/admin/text-review` route, sidebar link, API client/types, header, summary cards, and loading/empty/error states; frontend lint/build pass. |
| S022.3 - Review Table And Mobile Cards | Done | Filters, phrase-first desktop table, mobile cards, reference text display, and pagination; frontend lint/build pass. |
| S022.4 - Approve, Reject, And Edit Actions | Done | One-click approve/reject via concept text update, edit deep link, desktop and mobile actions; frontend lint/build pass. |
| S022.5 - Tests, Docs, And Stabilization | Done | Review-queue backend tests, full pytest, frontend lint/build, API docs, and slice board updated; S022 complete. |

## Epic 5 - Lessons and Learner Experience

Parent spec: **`docs/slices/E05-lessons/00-overview.md`**. One child slice per Cursor chat (**S023.1** through **S023.15**). First complete target: **Greeting Grandma** (5 items, 4 MVP types).

| Slice | Status | Notes |
|---|---|---|
| S023 - Lessons and Lesson Items MVP | Planned | Parent epic; admin + public + player vertical slices |
| S023.1 - Database + backend foundation | Done | `lessons`, `lesson_items` tables and models |
| S023.2 - Backend lessons API | Done | Admin CRUD `/api/admin/lessons` |
| S023.3 - Admin lessons list screen | Done | `/admin/content/lessons` |
| S023.4 - Admin create/edit lesson screen | Done | Create Greeting Grandma shell |
| S023.5 - Backend lesson items API | Done | Items CRUD + reorder |
| S023.6 - Admin lesson items builder | Done | Curriculum builder list |
| S023.7 - Admin create/edit lesson item | Done | Dynamic form + concept picker |
| S023.8 - Public lessons API + listing | Planned | `GET /api/lessons`, `lesson_public_service`, `/lessons` UI |
| S023.9 - Public lesson intro | Planned | `/lessons/:slug` before play |
| S023.10 - Lesson player shell | Planned | `/lessons/:slug/play` placeholders |
| S023.11 - Renderer: VOCABULARY | Planned | First real learner screen |
| S023.12 - Renderer: PHRASE | Planned | Phrase + usage note |
| S023.13 - Renderer: AUDIO_LISTEN | Planned | Listen-first + show text |
| S023.14 - Renderer: CULTURAL_NOTE | Planned | Warm culture card |
| S023.15 - Seed Greeting Grandma + QA | Planned | Full loop + stabilization |
| S017 - Learner lesson shell | Superseded | Covered by S023.10 |
| S018 - First lesson flow | Superseded | Covered by S023.8–S023.15 |
| S019 - Exercise interaction | Superseded | Covered by S023.11–S023.14 |

## Epic 6 - Quality + Regression Coverage

| Slice | Status | Notes |
|---|---|---|
| S020 - Playwright E2E Testing Setup | Done | Frontend Playwright setup with public experience smoke coverage; lint, build, and E2E checks pass per slice doc. |
