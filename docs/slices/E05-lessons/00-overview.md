# S023 - Lessons and Lesson Items MVP

## Epic

Epic 5 - Lessons and Learner Experience

## Status

Planned

## Goal

Deliver one complete learning loop — from curated concepts through admin lesson building to a child sitting with grandma playing **Lesson 1: Greeting Grandma** — before scaling curriculum or adding more item types.

Sounglah lessons are not generic course modules. They are short, warm, family-centered sequences that help a child speak with parents and grandparents. This epic turns published concepts and approved concept texts into ordered learner screens.

## Prerequisites

These slices assume the content foundation is in place:

- Languages, Concepts, and Concept Texts CRUD (S011–S013).
- Concept text audio recording and review (S014.x audio child slices).
- Content admin stabilization (S016).
- Concept completion and publish workflow (S021).
- Heritage text review queue (S022).

**Do not start S023 until concept completion and text/audio review workflows are usable.** Lesson items depend on reliable, curated ConceptTexts and approved Médumba audio.

## Mental Model

```text
Curated Concepts (published, EN + FR + MED texts, approved audio)
        ↓
Create Lesson (admin)
        ↓
Add LessonItems in learning order (admin curriculum builder)
        ↓
Each LessonItem = one learner screen in the lesson player
        ↓
Family opens /lessons → intro → play → finish
```

Keep this workflow in mind:

1. Learn grandma (VOCABULARY)
2. Learn greeting (VOCABULARY)
3. Learn the phrase (PHRASE)
4. Listen carefully (AUDIO_LISTEN)
5. Understand the culture (CULTURAL_NOTE)

## First MVP Lesson

Build **only this lesson** before duplicating the pattern for Greeting Grandpa, Mother, Father, etc.

| Field | Value |
| --- | --- |
| Title | Greeting Grandma |
| Slug | `greeting-grandma` |
| Description | Learn how to greet grandma with love and respect. |
| Difficulty | Beginner |
| Estimated time | 3–5 minutes |
| Audience | Children + family |
| Status | Draft → Published when all items are ready |

### Lesson items (in order)

| # | Type | Title / purpose | Concept | Notes |
| --- | --- | --- | --- | --- |
| 1 | VOCABULARY | Grandma | `grandmother` (create if missing) | Image + Médumba word + EN/FR + audio |
| 2 | VOCABULARY | Hello / Greeting | `hello` or dedicated `greeting` concept | Simple greeting word + play audio |
| 3 | PHRASE | Hello Grandma | `hello_grandma` (phrase concept) | Full phrase + translation + audio; reusable expression |
| 4 | AUDIO_LISTEN | Listen Carefully | `hello_grandma` | Large play button; text hidden until “Show text” |
| 5 | CULTURAL_NOTE | Greeting Elders | _(none)_ | Warm note on respect and connection |

**Seed note:** `grandmother` and `hello_grandma` are not in `concepts_seed.csv` today. S023.15 creates or confirms these concepts with completed texts and audio before seeding the lesson.

## MVP Lesson Item Types

Use **only these four types** until the workflow feels solid:

| Type | Concept required? | Learner purpose |
| --- | --- | --- |
| `VOCABULARY` | Yes | Teach one word/idea with image, translations, audio |
| `PHRASE` | Yes | Combine concepts into a useful expression |
| `AUDIO_LISTEN` | Yes | Listening-first practice; optional hidden text |
| `CULTURAL_NOTE` | No | Explain why the lesson matters culturally |

Future types (`QUIZ`, `MATCH`, `REPEAT`, etc.) are out of scope for this epic.

## Data Model (MVP)

### `lessons`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `title` | string | Required |
| `slug` | string | Unique, URL-safe; used in `/lessons/:slug` |
| `description` | text | Optional learner/admin summary |
| `difficulty` | enum/string | Same as concepts: `beginner`, `intermediate`, `advanced` |
| `estimated_minutes` | integer | e.g. 3–5 |
| `cover_image_url` | string | Nullable; Cloudinary URL when set |
| `cover_image_public_id` | string | Nullable; for Cloudinary delete |
| `cover_image_alt_text` | string | Accessibility |
| `status` | enum | `draft`, `published`, `archived` |
| `order_index` | integer | Curriculum ordering |
| `created_at`, `updated_at` | datetime | Standard |

**Relationship:** `lesson_items.lesson_id → lessons.id`

**Public visibility:** Only `status = published` lessons appear on `/lessons` and public API.

### `lesson_items`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `lesson_id` | UUID | Required FK |
| `type` | enum | `VOCABULARY`, `PHRASE`, `AUDIO_LISTEN`, `CULTURAL_NOTE` |
| `concept_id` | UUID | Nullable FK; required for concept-backed types |
| `title` | string | Admin + learner heading |
| `instruction_text` | text | Optional prompt (e.g. “Listen carefully”) |
| `content_json` | JSON | Type-specific payload (see below) |
| `order_index` | integer | Unique per lesson |
| `is_active` | boolean | Inactive items skipped in player |
| `created_at`, `updated_at` | datetime | Standard |

**Relationship:** `lesson_items.concept_id → concepts.id` (nullable)

### `content_json` by type

| Type | Keys |
| --- | --- |
| `VOCABULARY` | _(empty or future hints)_ |
| `PHRASE` | `usageNote` — optional short context |
| `AUDIO_LISTEN` | `hideTextUntilPlayed` — boolean, default true |
| `CULTURAL_NOTE` | `noteTextEn`, `noteTextFr` — required; `imageUrl`, `imageAltText` optional |

Resolve learner-facing Médumba/English/French text and audio from the linked **Concept** and its **ConceptTexts** + approved `current_audio_id`. Do not duplicate phrase text in `content_json` when a concept backs the item.

## Relationship to Legacy Slice Docs

| Old ID | Location | Status |
| --- | --- | --- |
| S014 - Lessons CRUD | E04 | **Superseded by S023** — use this epic’s model and build order |
| S015 - Lesson Items CRUD | E04 | **Superseded by S023** — MVP types differ from seed `vocabulary_card` / `story_segment` |
| S017 - Learner lesson shell | E05 (old) | **Superseded by S023.10** |
| S018 - First lesson flow | E05 (old) | **Superseded by S023.8–S023.15** |
| S019 - Exercise interaction | E05 (old) | **Superseded by S023.11–S023.14** |

Seed CSVs under `backend/sounglah_extraction/` (`lessons_seed.csv`, `lesson_items_seed.csv`) remain useful for later bulk import but **do not drive the MVP schema**. Map or migrate them after the Greeting Grandma loop works.

## Child Slices

| ID | Name | Status |
| --- | --- | --- |
| S023.1 | Database + backend foundation | Done |
| S023.2 | Backend lessons API | Done |
| S023.3 | Admin lessons list screen | Done |
| S023.4 | Admin create/edit lesson screen | Planned |
| S023.5 | Backend lesson items API | Planned |
| S023.6 | Admin lesson items builder screen | Planned |
| S023.7 | Admin create/edit lesson item screen | Planned |
| S023.8 | Public lessons API + listing screen | Planned |
| S023.9 | Public lesson intro screen | Planned |
| S023.10 | Lesson player shell | Planned |
| S023.11 | Item renderer: VOCABULARY | Planned |
| S023.12 | Item renderer: PHRASE | Planned |
| S023.13 | Item renderer: AUDIO_LISTEN | Planned |
| S023.14 | Item renderer: CULTURAL_NOTE | Planned |
| S023.15 | Seed Greeting Grandma + MVP stabilization | Planned |

## Recommended Build Order

Build vertically. Each step should be usable before the next.

```text
S023.1  DB + models
   ↓
S023.2  Admin lessons API
   ↓
S023.3  Admin lessons list
   ↓
S023.4  Admin lesson form  → can create “Greeting Grandma” shell
   ↓
S023.5  Lesson items API
   ↓
S023.6  Items builder list
   ↓
S023.7  Item create/edit    → can add all 5 items
   ↓
S023.8  Public /lessons
   ↓
S023.9  Lesson intro
   ↓
S023.10 Player shell        → placeholders per type
   ↓
S023.11–S023.14             → one renderer per chat
   ↓
S023.15                     → seed + QA full loop
```

**One child slice per Cursor chat.** Do not batch S023.11–S023.14 in a single run unless the human explicitly overrides.

## Product Decisions (Locked For MVP)

| Topic | Decision |
| --- | --- |
| HTTP verbs | **`PATCH`** for admin updates (matches Languages, Concepts, Concept Texts). **`POST`** create, **`DELETE`** remove. |
| Admin routes | Keep existing **`/admin/content/...`** prefix (sidebar, router, redirects). |
| Lesson Items nav | **No standalone sidebar link.** Manage items only inside each lesson’s curriculum builder. Redirect legacy `/admin/content/lesson-items` → lessons list. |
| Difficulty | **`beginner` \| `intermediate` \| `advanced`** — same enum/check constraint pattern as concepts. |
| Learner accounts | **Deferred.** MVP is anonymous family use (child + grandma, one device). No signup, login, or saved progress in S023. |
| Public lesson API | **`GET /api/lessons`** and **`GET /api/lessons/:slug`** — no auth, no `/api/public/` prefix (consistent with `/api/health`, `/api/auth`). |
| Publish guards | Published lesson requires ≥1 **active** item; every active concept-backed item must link a **published** concept. Warn in admin UI; **block publish** on backend. |
| Cultural note text | **`noteTextEn`** and **`noteTextFr`** in `content_json`; player picks by UI locale. |
| AUDIO_LISTEN continue | **Do not hard-gate** Continue on audio played (3-year-old UX). Encourage listening with copy; Continue always enabled. |
| Médumba seed content | S023.15 builder **must ask the human** for grandmother / hello-grandma Médumba wording and audio before seeding. |
| Delete behavior | **`DELETE`** removes rows (lessons cascade to items). Use **`status = archived`** to hide without deleting. Confirm dialog in admin UI. |
| Player step state | **In-memory only** (`useState` on play route). No `?step=` URL, no sessionStorage — refresh restarts the lesson (fits anonymous MVP). |
| Public API implementation | **`lesson_public_service.py`** + **`lessons_bp`** at `/api/lessons`; register in `create_app` without `@require_admin`. |

## API Summary

### Admin (authenticated, `@require_admin`)

```text
GET    /api/admin/lessons
GET    /api/admin/lessons/:id
POST   /api/admin/lessons
PATCH  /api/admin/lessons/:id
DELETE /api/admin/lessons/:id

GET    /api/admin/lessons/:lessonId/items
POST   /api/admin/lessons/:lessonId/items
PATCH  /api/admin/lesson-items/:id
DELETE /api/admin/lesson-items/:id
PATCH  /api/admin/lesson-items/:id/reorder
```

### Public (no auth — anonymous learners)

```text
GET /api/lessons                 # published only, list shape
GET /api/lessons/:slug           # published lesson + active items + conceptPayload
```

Admin list includes drafts; public endpoints return **404** for non-published lessons.

Register a **`lessons_bp`** blueprint at `/api/lessons` without `@require_admin`. Admin stays at `/api/admin/lessons`.

## Admin Routes

Use existing content-admin prefix (replace S010 placeholders in S023.3):

```text
/admin/content/lessons
/admin/content/lessons/new
/admin/content/lessons/:id/edit
/admin/content/lessons/:lessonId/items
/admin/content/lessons/:lessonId/items/new
/admin/content/lessons/:lessonId/items/:itemId/edit
```

Legacy redirect: `/admin/content/lesson-items` → `/admin/content/lessons` (remove standalone Lesson Items sidebar link in S023.6).

## Public Routes

```text
/lessons                               # catalog
/lessons/:slug                         # intro before play
/lessons/:slug/play                    # player; step index in React state only
```

## Concept Completion Integration

When picking concepts in S023.7, show completion badges per language (EN, FR, MED) and **warn** if the concept is incomplete or unpublished. Lesson player should still handle missing audio gracefully (disabled play + friendly message).

### Publish guards (backend + admin UI)

When admin sets `status = published`:

1. Lesson must have **≥1 active** lesson item.
2. Every **active** item with a required concept (`VOCABULARY`, `PHRASE`, `AUDIO_LISTEN`) must reference a concept where `published_at` is not null.
3. Return **400** with field-level reasons if blocked; show the same reasons on the Publish button in S023.4.

Draft lessons may reference incomplete concepts while curriculum is being built.

## Public Play Payload Contract

`GET /api/lessons/:slug` returns the lesson and ordered active items. Resolve concept-backed content server-side so the player stays thin.

### List response (`GET /api/lessons`)

```json
{
  "data": [
    {
      "slug": "greeting-grandma",
      "title": "Greeting Grandma",
      "description": "Learn how to greet grandma with love and respect.",
      "difficulty": "beginner",
      "estimatedMinutes": 5,
      "coverImageUrl": "https://...",
      "coverImageAltText": "Child greeting grandmother",
      "activeItemCount": 5
    }
  ]
}
```

### Detail / play response (`GET /api/lessons/:slug`)

```json
{
  "slug": "greeting-grandma",
  "title": "Greeting Grandma",
  "description": "...",
  "difficulty": "beginner",
  "estimatedMinutes": 5,
  "coverImageUrl": "...",
  "coverImageAltText": "...",
  "items": [
    {
      "id": "uuid",
      "type": "VOCABULARY",
      "title": "Grandma",
      "instructionText": null,
      "orderIndex": 1,
      "contentJson": {},
      "conceptPayload": {
        "id": "uuid",
        "key": "grandmother",
        "imageUrl": "https://...",
        "imageAltText": "...",
        "texts": {
          "en": { "text": "Grandma", "pronunciation": null, "audioUrl": null },
          "fr": { "text": "Grand-mère", "pronunciation": null, "audioUrl": null },
          "med": {
            "text": "…",
            "pronunciation": "…",
            "audioUrl": "https://...",
            "hasApprovedAudio": true
          }
        }
      }
    },
    {
      "id": "uuid",
      "type": "CULTURAL_NOTE",
      "title": "Greeting Elders",
      "orderIndex": 5,
      "contentJson": {
        "noteTextEn": "In many families, greeting grandma or elders shows love, respect, and connection.",
        "noteTextFr": "Dans beaucoup de familles, saluer grand-mère ou les aînés montre l'amour, le respect et le lien."
      },
      "conceptPayload": null
    }
  ]
}
```

### Resolver rules (`conceptPayload`)

- Load concept by `lesson_items.concept_id`; omit payload if concept missing or disabled (player shows friendly fallback).
- **Image:** `concept.image_url` ?? `concept.default_image_url`; alt from `concept.image_alt_text`.
- **Texts:** Active `ConceptText` rows keyed by `languages.code` (`en`, `fr`, `med`).
- **Audio:** Only Médumba (`med`) sets `audioUrl` from approved `current_audio_id` → `ConceptTextAudio.audio_url`; set `hasApprovedAudio: true` when present.
- Do **not** expose draft/unpublished concept text in public API for unpublished lessons; for published lessons, still resolve linked concepts even if text review is imperfect — missing fields become null and UI degrades gracefully.

Implement resolver in a backend service (e.g. `lesson_public_service.py`) reused by list item counts and detail.

## Reorder API

**Purpose:** Powers **Move up** / **Move down** in the curriculum builder (S023.6) without drag-and-drop.

```text
PATCH /api/admin/lesson-items/:id/reorder
{ "direction": "up" | "down" }
```

Backend swaps `order_index` with the adjacent active item in the same lesson inside a transaction. Return updated ordered list or 409 if already first/last.

Alternative `{ "orderIndex": 3 }` is out of scope for MVP unless builder prefers it over direction swap.

## Out Of Scope (Entire Epic)

- Learner signup, login, profiles, and **saved progress across sessions**
- Scoring, quizzes, branching paths
- Drag-and-drop reorder (use move up/down or PATCH reorder)
- Bulk import from `lessons_seed.csv` / `lesson_items_seed.csv`
- Additional lesson item types beyond the MVP four
- Lesson-level language field (Médumba-only MVP; infer from concepts)
- Unpublish workflow beyond draft/archived
- Mobile native apps

## Definition Of Done (Parent)

S023 is done when:

- Admin can create **Greeting Grandma** with five ordered items.
- Lesson can be published.
- A family can open `/lessons`, start the lesson, complete all five screens, and hear approved Médumba audio where concepts provide it.
- Backend tests, frontend lint, and frontend build pass for touched areas.
- `docs/slice-board.md` and child slice docs reflect shipped reality.

## Future (Post-MVP)

- Learner signup/login and saved progress (`GET /api/me/lesson-progress` or similar).
- Shareable player URLs with `?step=` once accounts or session resume matter.
- Bulk CSV import from extraction seeds.
