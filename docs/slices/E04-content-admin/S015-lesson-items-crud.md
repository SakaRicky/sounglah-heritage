# S015 - LessonItems CRUD

> **Superseded by [S023 — Lessons and Lesson Items MVP](../E05-lessons/00-overview.md).** MVP item types are `VOCABULARY`, `PHRASE`, `AUDIO_LISTEN`, `CULTURAL_NOTE` — not seed `vocabulary_card` / `story_segment`. Builders should follow **S023.5–S023.7** and player slices **S023.11–S023.14**.

## Epic

Epic 4 - Content Admin CRUD (historical)

## Status

Superseded

## Goal

Build admin CRUD for the small learning steps inside a lesson.

Lesson Items turn a lesson into an ordered sequence. For MVP, they should support vocabulary cards backed by Concepts and Concept Texts, while leaving room for story/culture segments that do not map to a single concept.

## Current Context

- Admin placeholders already route to `/admin/content/lesson-items`.
- `backend/sounglah_extraction/lesson_items_seed.csv` currently includes `266` rows.
- Every seed item references an existing `lesson_key`.
- `206` seed items reference a `concept_key` that exists in `concepts_seed.csv`.
- `60` seed items have a blank `concept_key`; all are `story_segment` rows for story/culture lessons.
- This means `concept_id` must be nullable for story/culture items, even though vocabulary items should normally require a concept.

## Proposed Model

Use the existing backend patterns from the content admin models:

- UUID primary key.
- `created_at` and `updated_at`.
- Soft status instead of hard delete.
- Foreign keys for lesson and optional concept references.

Suggested fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key. |
| `lesson_id` | Required reference to `lessons.id`. |
| `lesson_item_key` | Stable import/admin identifier, unique if retained from seed `lesson_item_id`. |
| `order_index` | Required integer order within the lesson. |
| `item_type` | Learning item type, initially `vocabulary_card` or `story_segment`. |
| `concept_id` | Optional reference to `concepts.id`; required for concept-backed vocabulary cards. |
| `prompt_language_id` | Optional reference to the prompt/source language. |
| `answer_language_id` | Optional reference to the answer/target language. |
| `prompt_text` | Optional prompt text from seed/imports. |
| `source_files` | Optional provenance from extraction files. |
| `notes` | Internal review/import notes. |
| `status` | `draft`, `active`, `disabled`, or `archived`. |
| `review_status` | `draft`, `needs_review`, or `approved`. |

## Item Types

Start with the types already present in seed data:

- `vocabulary_card`: concept-backed item for a word or phrase.
- `story_segment`: freeform story/culture passage that may not map to a single concept.

Future item types can be added later:

- `listen_choose`
- `match_text`
- `repeat_after_me`
- `fill_blank`
- `culture_note`

Do not build interaction-specific fields until S017+ learner flow needs them.

## Validation Rules

Recommended MVP validation:

- `lesson_id` is required and must reference an existing lesson.
- `order_index` is required and must be unique per lesson.
- `item_type` is required.
- `concept_id` is required when `item_type = vocabulary_card`.
- `concept_id` is optional when `item_type = story_segment`.
- Disabled lessons should not receive new active items.
- Disabled concepts should not be attached to new vocabulary items.
- `prompt_language_id` and `answer_language_id` should reference existing languages when provided.
- `status` must be one of `draft`, `active`, `disabled`, or `archived`.
- `review_status` must be one of `draft`, `needs_review`, or `approved`.

## API Contract

Admin endpoints should use the existing `/api/admin` prefix and authentication pattern:

```text
GET    /api/admin/lesson-items
GET    /api/admin/lesson-items/:id
POST   /api/admin/lesson-items
PATCH  /api/admin/lesson-items/:id
PATCH  /api/admin/lesson-items/:id/status
```

Recommended filters:

- `lessonId`
- `itemType`
- `status`
- `reviewStatus`
- `conceptId`
- `page`
- `pageSize`
- `sort`: `order`, `updated`, or `type`

Useful nested endpoint for the lesson editor:

```text
GET /api/admin/lessons/:lessonId/items
```

Only add the nested endpoint if it clearly reduces frontend complexity during S015.

## Admin UI Contract

Route:

```text
/admin/content/lesson-items
```

The page should include:

- Page title and short description.
- Lesson filter.
- Search/filter by type, status, and review status.
- Lesson item table.
- Create/edit form.
- Disable/enable confirmation dialog.
- Clear display for concept-backed versus story/culture rows.

Table columns should start with:

- Lesson.
- Order.
- Type.
- Prompt.
- Concept.
- Prompt language.
- Answer language.
- Review status.
- Status.
- Updated date.
- Actions.

## Seed Import Notes

`backend/sounglah_extraction/lesson_items_seed.csv` currently includes:

- `lesson_item_id`
- `lesson_key`
- `order_index`
- `item_type`
- `concept_key`
- `prompt_language`
- `answer_language`
- `prompt_text`
- `source_files`
- `status`
- `notes`

The seed status values should be normalized similarly to lessons:

- `draft_needs_review` -> `status = draft`, `review_status = needs_review`
- `needs_review` -> `status = draft`, `review_status = needs_review`

Vocabulary rows should resolve:

- `lesson_key` -> `lessons.lesson_key`
- `concept_key` -> `concepts.key`
- `prompt_language` and `answer_language` -> `languages.code`

Story segment rows with blank `concept_key` are valid and should be imported without a concept reference.

## Acceptance Criteria

- Admin can add items to lessons.
- Items can reference concepts or text.
- Vocabulary card items require a concept.
- Story segment items can be saved without a concept.
- Admin can reorder items through `order_index`.
- Admin can filter items by lesson, type, status, and review status.
- Admin can disable and re-enable items without deleting them.
- Backend and frontend checks pass for the touched areas.
- `docs/slice-board.md` and this slice doc are updated after implementation.

## Out Of Scope

- Learner-facing exercise rendering.
- Drag-and-drop ordering.
- Audio playback rules inside lesson player.
- Progress tracking.
- Scoring or correctness.
- Complex branching lesson flows.

## Open Decisions For Builder

- Whether S015 should include lesson-scoped item management inside the Lessons page or keep a standalone Lesson Items page for the first pass.
- Whether `lesson_item_key` should remain user-visible or only be used for seed/import idempotency.
- Whether text display should be resolved through Concept Texts immediately or deferred to learner flow slices.
