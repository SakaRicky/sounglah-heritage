# S014 - Lessons CRUD

> **Superseded by [S023 — Lessons and Lesson Items MVP](../E05-lessons/00-overview.md).** Keep this file for historical context and seed CSV notes only. Builders should follow **S023.1–S023.15** instead.

## Epic

Epic 4 - Content Admin CRUD (historical)

## Status

Superseded

## Goal

Build admin CRUD for structured lessons that group concept-backed vocabulary and later story/culture items into a family-centered learning sequence.

Lessons are the bridge between content management and the learner experience. They should stay simple enough for MVP, but explicit enough that S015 Lesson Items and S017+ learner flows can depend on them without guessing.

## Current Context

- Admin placeholders already route to `/admin/content/lessons`.
- Seed files already include `15` lesson rows in `backend/sounglah_extraction/lessons_seed.csv`.
- `12` seed lessons are marked `recommended_for_mvp=True`.
- Lesson item seed rows reference lessons by `lesson_key`.
- S016 verified the language, concept, concept text, audio, and seed foundations closely enough to proceed.
- This slice ID overlaps with the earlier audio `S014.x` child slices. Existing admin placeholders still point at `S014`, so keep this ID unless a separate renumbering cleanup is done intentionally.

## Proposed Model

Use the existing backend patterns from Languages, Concepts, and Concept Texts:

- UUID primary key.
- `created_at` and `updated_at`.
- Soft status instead of hard delete.
- Thin route handlers backed by model/schema helpers as needed.

Suggested fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key. |
| `lesson_key` | Stable internal identifier from seed/imports, unique. |
| `slug` | URL-safe identifier for future learner routes, unique. |
| `title` | Human-friendly admin and learner label. |
| `language_id` | Target heritage language, initially Médumba. |
| `level` | MVP difficulty label, such as `beginner`, `beginner_plus`, `intermediate`, or `advanced`. |
| `primary_category` | Main grouping such as `greetings_politeness`, `family_people`, or `story`. |
| `description` | Optional admin/learner summary. |
| `source_files` | Optional provenance from extraction files. |
| `notes` | Internal review/import notes. |
| `status` | `draft`, `active`, `disabled`, or `archived`. |
| `review_status` | `draft`, `needs_review`, or `approved`. |
| `recommended_for_mvp` | Boolean flag for early curriculum selection. |
| `sort_order` | Admin and learner ordering. |

## Status Rules

Recommended MVP status behavior:

- `draft`: lesson is being shaped and should not appear in learner-facing flows.
- `active`: lesson can be used by later learner flows.
- `disabled`: lesson is intentionally hidden but kept for dependencies.
- `archived`: lesson is retained for history/import traceability.

Review status remains separate:

- `draft`: not ready for content review.
- `needs_review`: needs language/content review.
- `approved`: reviewed enough for MVP use.

## API Contract

Admin endpoints should use the existing `/api/admin` prefix and authentication pattern:

```text
GET    /api/admin/lessons
GET    /api/admin/lessons/:id
POST   /api/admin/lessons
PATCH  /api/admin/lessons/:id
PATCH  /api/admin/lessons/:id/status
```

Recommended list filters:

- `search`
- `languageId`
- `status`
- `reviewStatus`
- `level`
- `primaryCategory`
- `recommendedForMvp`
- `page`
- `pageSize`
- `sort`: `sortOrder`, `title`, `updated`, or `level`

Search should cover:

- title
- lesson key
- slug
- primary category
- notes

## Admin UI Contract

Route:

```text
/admin/content/lessons
```

The page should include:

- Page title and short family-centered description.
- Add lesson button.
- Search.
- Filters for status, review status, level, language, category, and MVP recommendation.
- Lessons table.
- Empty, loading, and error states.
- Create/edit form using the established admin form styling.
- Disable/enable confirmation dialog.

Table columns should start with:

- Lesson title.
- Key/slug.
- Language.
- Level.
- Category.
- Review status.
- Status.
- MVP flag.
- Sort order.
- Updated date.
- Actions.

## Seed Import Notes

`backend/sounglah_extraction/lessons_seed.csv` currently includes:

- `lesson_key`
- `title`
- `level`
- `primary_category`
- `source_files`
- `notes`
- `status`
- `recommended_for_mvp`

The seed status value `draft_needs_review` should be mapped into separate model fields:

- `status = draft`
- `review_status = needs_review`

For the first implementation, seed all lessons against the active Médumba language unless the import source later includes an explicit language code.

## Relationship To Lesson Items

S014 should create lessons only. It should not build the full item editor.

However, the model must be ready for S015:

- Lesson Items will reference lessons by `lesson_id`.
- Lesson ordering should be stable through `sort_order`.
- Lesson status should allow hiding a lesson without deleting dependent items.
- A lesson can exist with zero items while curriculum content is being built.

## Acceptance Criteria

- Admin can create and manage lessons.
- Lessons can be connected to a target language.
- Admin can filter and search lessons.
- Admin can disable and re-enable lessons without deleting them.
- Duplicate `lesson_key` and `slug` values are rejected.
- Lessons can later contain lesson items through S015.
- Backend and frontend checks pass for the touched areas.
- `docs/slice-board.md` and this slice doc are updated after implementation.

## Out Of Scope

- Learner-facing lesson player.
- Progress tracking.
- Exercise interaction logic.
- Full curriculum path management.
- Drag-and-drop ordering.
- Publishing workflow beyond status/review fields.

## Open Decisions For Builder

- Whether `level` should reuse the same enum as concepts or accept seed values like `beginner_story`.
- Whether `primary_category` should remain a string for MVP or become a controlled category table later.
- Whether the first UI should show item counts once S015 exists, or defer counts until after item CRUD.
