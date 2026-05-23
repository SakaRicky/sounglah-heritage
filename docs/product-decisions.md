# Product Decisions

This file stores important decisions so future Cursor agents do not restart the same discussions.

## Decision 1: Product Positioning

Sounglah is positioned as a heritage language learning platform for diaspora families, not a generic translation app.

## Decision 2: First Language

The first language is Médumba.

## Decision 3: Multi-Language Future

The app should be designed so more languages can be added later without rewriting the entire system.

## Decision 4: MVP Scope

The MVP should not copy all of Duolingo. It should focus on short, practical, family-centered learning experiences.

## Decision 5: Early Build Order

Early build order:
1. Foundation
2. Public landing page
3. Login/admin shell
4. Admin CRUD
5. Learner experience

## Decision 6: Frontend Stack

Use React + Vite + TypeScript + Tailwind.

## Decision 7: Backend Stack

Use Flask for the backend server.

## Decision 8: Agent Workflow

Use three default agents:
1. Planner
2. Builder
3. Reviewer

Specialist agents should be used only when necessary.

## Decision 9: Lessons MVP Scope (S023)

- **Prerequisite:** Concept completion and text/audio review (S021, S022) before lessons depend on concepts.
- **First lesson:** Greeting Grandma — one emotionally meaningful lesson for a young child with grandma, not bulk seed import.
- **MVP item types only:** `VOCABULARY`, `PHRASE`, `AUDIO_LISTEN`, `CULTURAL_NOTE`.
- **Mental model:** Curated concepts → create lesson → ordered lesson items → one screen per item in the player.
- **Build order:** Database → admin lessons → admin items builder → public list → intro → player shell → one renderer per type → seed Greeting Grandma.
- **Public visibility:** Only `published` lessons on `/lessons`; resolve learner text/audio from ConceptTexts, not duplicated in lesson item fields.
- **Legacy:** E04 S014/S015 and old E05 S017–S019 are superseded by epic **S023** (`docs/slices/E05-lessons/`).
- **Learner accounts:** Deferred for MVP. Anonymous `GET /api/lessons` with no saved progress; session-only player state.
- **Public API:** `/api/lessons` (not `/api/public/...`); admin at `/api/admin/lessons`.
- **Lesson item admin nav:** Nested under each lesson only; no standalone Lesson Items sidebar link.
- **Publish guard:** Block publishing a lesson unless it has active items and all active concept-backed items link published concepts.
- **Cultural notes:** `noteTextEn` + `noteTextFr` in `content_json`.
- **AUDIO_LISTEN:** Continue never hard-gated on listen completion.
- **Delete:** Hard `DELETE` with lesson→items CASCADE; use `archived` status to hide without deleting.
- **Player navigation:** In-memory step index only; refresh restarts lesson.
- **Public API service:** `lesson_public_service.py` + `lessons_bp` at `/api/lessons`.

## Decision 10: Heritage Audio Gates Concept Readiness (S024)

- Audio is required learning content for Médumba and future heritage/local languages.
- Do **not** block `ConceptText.status = active` when audio is missing; active text rows must remain available for review, recording, replacement, and missing-audio workflows.
- A required heritage-language concept text counts as complete only when it is active, text-approved, and has approved current audio.
- Concept publishing must block when required heritage audio is missing, pending, or rejected.
- English and French support-language texts do not require audio for completion in the MVP.
- Lesson publishing inherits this rule by requiring concept-backed lesson items to link published concepts.
- Learner missing-audio UI remains as a defensive fallback, not the expected state for published concept-backed lessons.
