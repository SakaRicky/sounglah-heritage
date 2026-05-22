# S022 - Text Review Queue

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Goal

Give heritage-language reviewers a focused queue for approving or rejecting concept **text** translations — separate from the general Concept Texts CRUD table and parallel to the existing Audio Review queue.

Families depend on accurate Médumba (and future heritage) wording before lessons use a concept. Reviewers should open one place, see what needs a decision, compare against support-language context when helpful, and move through the queue quickly on phone or desktop.

## Planner Decision: One Screen or Two?

### Question

Can **Text Review** and **Audio Review** live on one screen?

### Answer

**No for a single shared queue/table.** **Yes only as separate tabs on a parent “Review” hub** — but that hub is **not recommended for v1**.

| Approach | Verdict | Why |
| --- | --- | --- |
| One table mixing text rows and audio rows | **Reject** | Different entities (`ConceptText` vs `ConceptTextAudio`), columns, actions (read vs play), and side effects (update `review_status` vs set `current_audio_id`). Reviewers would constantly context-switch inside each row. |
| One page with **Text \| Audio** tabs, reusing each queue’s layout | **Possible later** | Shared shell (header, filters pattern, mobile cards) is reasonable, but Audio Review already ships at `/admin/audio-review`. Merging now is refactor churn with no user gain. |
| **Two dedicated review pages** (Audio Review + new Text Review) | **Recommended** | Matches the shipped S014.9 pattern, keeps each workflow fast and obvious, and avoids regressions on a working page. |

### Product structure (recommended)

```text
Concept Texts table
  └── General CRUD, inline quick approve/reject, bulk actions, audio column

Text Review Queue          ← S022 (new)
  └── Heritage translations needing review

Audio Review Queue         ← S014.9 (done)
  └── Submitted pronunciations needing review

Concept Completion         ← S021 (done)
  └── Roll-up health + deep links into fixes
```

Later optional follow-up (not S022): a sidebar group **Review** with sub-links or a tabbed hub — only if reviewers ask for one entry point.

## Current Repo Context

- **Audio Review (done):** `/admin/audio-review`, `GET /api/admin/concept-text-audios/review-queue`, approve/reject with `review_note`, phrase-first mobile/desktop layout (S014.9).
- **Concept Texts CRUD (done):** `/admin/content/concept-texts` supports `reviewStatus` filter, inline `ConceptTextQuickReviewButtons`, and bulk approve/reject on the current page (S013 + post-S021).
- **Completion workflow (done):** `/admin/content/concepts/completion` deep-links to Concept Texts for heritage review gaps (S021.8).
- **Heritage gating (done):** `languages.requires_concept_text_review` — only these languages block concept publish until text is `approved` (S021.4).
- **Concept text review statuses:** `draft`, `needs_review`, `approved`, `rejected` on `ConceptText.review_status` (S021.2).
- **No dedicated text review queue API or route exists today.** Text review uses the general concept-texts list endpoint.
- **No text-level reject note field.** Audio rejections save `review_note` on `concept_text_audios`; `concept_texts` has no equivalent.

## Product Decisions

- Add slice ID **S022**; do not reopen S021 (Done).
- Default queue = **active** concept texts with `review_status = needs_review`.
- **Local languages only.** The queue includes only languages where `requiresConceptTextReview = true` — Médumba today and future heritage languages such as Duala, Fefe, and Bassa. **English and French never appear as queue rows**, even if they have `needs_review` status elsewhere.
- Language filter dropdown lists **local review languages only** (not all languages).
- **Phrase-first layout** on mobile and desktop (same UX principle as Audio Review).
- Approve sets `reviewStatus = approved`. Reject sets `reviewStatus = rejected`.
- **One-click reject.** No reject note, no reject confirmation modal, no new `review_note` column on `concept_texts` for v1. Match the existing Concept Texts quick reject behavior.
- Reuse existing concept text update for approve/reject; add dedicated approve/reject endpoints only if they simplify permissions later.
- Route: `/admin/content/concept-texts/review` (tab under Concept Texts; legacy `/admin/text-review` redirects).
- i18n: admin copy in EN/FR per project convention when user-facing strings are added.

## Non-Goals

- Merging Text and Audio review into one table or one combined queue API.
- Refactoring Audio Review into a tabbed hub (defer).
- Role-specific reviewer permissions (still admin-only; same as audio).
- Bulk approve/reject on the dedicated queue (optional later; Concept Texts page already supports bulk).
- Reject notes on concept text (defer; audio reject notes remain on `concept_text_audios` only).
- English/French rows in the text review queue.
- Lesson or learner-facing changes.
- Changing completion calculation rules (S021).

## Backend Contract

### Option A (preferred for v1): Dedicated review-queue endpoint

Mirror the audio pattern for predictable reviewer ordering and response shape.

```text
GET /api/admin/concept-texts/review-queue
```

Query params:

| Param | Default | Notes |
| --- | --- | --- |
| `reviewStatus` | `needs_review` | Also allow `rejected`, `draft`, `all` for audit/history views |
| `languageId` | _(empty)_ | Filter one **local review language**; must have `requires_concept_text_review = true` |
| `search` | _(empty)_ | Concept title/key or text body |
| `page`, `pageSize` | `1`, `25` | Same bounds as other admin lists |

**Hard rule:** every row must belong to a language with `requires_concept_text_review = true`. There is no `heritageOnly` toggle — local-language scope is always enforced server-side. Support languages (English, French) are excluded from the queue entirely.

Ordering (review queue):

1. `updated_at ASC` (oldest waiting first — FIFO fairness)
2. `concept.title ASC`
3. `language.name ASC`

Response row shape: existing `concept_text_to_dict` **plus optional reference texts** for side-by-side review:

```json
{
  "data": [
    {
      "id": "uuid",
      "text": "Màkòn",
      "reviewStatus": "needs_review",
      "concept": { "id": "uuid", "title": "Mother", "key": "mother" },
      "language": { "id": "uuid", "name": "Médumba", "code": "med" },
      "referenceTexts": [
        { "languageCode": "en", "text": "Mother" },
        { "languageCode": "fr", "text": "Mère" }
      ]
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "total": 18 }
}
```

`referenceTexts` = active concept texts for the same concept in English and French (support languages), shown **for context only** while reviewing the local-language phrase. Omit or empty array when none exist. Support-language texts are never returned as primary queue rows.

### Option B (fallback): Reuse list endpoint only

If the builder wants zero backend work for v1, the page may call existing `GET /api/admin/concept-texts` with `reviewStatus=needs_review&status=active` and client-filter heritage languages. **Downside:** no FIFO default, no bundled reference texts, weaker parity with Audio Review. Prefer Option A.

### Approve / reject

Reuse:

```text
PUT /api/admin/concept-texts/:id
{ "reviewStatus": "approved" | "rejected" }
```

Reject is one-click via `{ "reviewStatus": "rejected" }` — no body fields beyond status.

## Frontend Contract

### Route

```text
/admin/content/concept-texts/review
```

Protected inside existing admin layout.

### Page sections

1. **Header** — title “Text Review”, warm description about heritage accuracy for families.
2. **Summary cards** — count matching filter, pending on page, selected language (mirror Audio Review stats pattern).
3. **Filters** — review status (default `needs_review`), local language (Médumba, future Duala/Fefe/Bassa, etc.), search, reset. No toggle to include English/French.
4. **Queue** — desktop table + mobile stacked cards.

### Table / card columns

| Column | Notes |
| --- | --- |
| Text to review | **First column / hero** — large, high-contrast phrase |
| Concept | Title + key |
| Language | Name + code |
| Reference | EN/FR support text when available |
| Status | Review badge |
| Updated | When last changed |
| Actions | Approve, one-click Reject, optional Edit (deep link to Concept Texts form) |

Mobile cards: same information order as Audio Review — **phrase first**, then concept, language, reference, actions.

### Empty state

“When translators submit heritage text for review, it will appear here.” Link to Concept Texts or Completion dashboard.

### Navigation

- Add **Text Review** sidebar link next to Audio Review.
- Do **not** remove inline review from Concept Texts or Completion quick actions.

## Child Slice Breakdown

### S022.1 - Text Review Queue API

Status: Done

Goal: Provide a reviewer-oriented list endpoint with heritage default and reference context.

Scope:

- Add `GET /api/admin/concept-texts/review-queue`.
- Implement FIFO ordering and **always-on** local-language filter (`requires_concept_text_review = true`).
- Attach `referenceTexts` (EN/FR context only) per row.
- API docs + backend tests.

Acceptance criteria:

- Default response is active local-language texts in `needs_review`.
- English/French concept texts never appear in queue results.
- Filters and pagination work.
- Reference texts include en/fr when present.
- Auth matches other admin concept-text routes.

Implementation notes:

- Added `GET /api/admin/concept-texts/review-queue` before the `/:id` route.
- Queue always filters `Language.requires_concept_text_review = true` and `ConceptText.status = active`.
- Default `reviewStatus=needs_review`; supports `draft`, `rejected`, and `all` for history views.
- FIFO ordering via `updated_at ASC`.
- Each row includes `referenceTexts` from active English/French concept texts on the same concept.
- Rejects `languageId` filters for non-local languages with a validation error.
- Extended `concept_text_to_dict()` with optional `referenceTexts`.
- Updated `docs/api/concept-texts-api.md` and added six focused backend tests.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_concept_texts.py -k review_queue
```

Result: passed, `6 passed`.

### S022.2 - Text Review Page Shell

Status: Done

Goal: Add route, API client, types, loading/empty/error states.

Scope:

- Route `/admin/text-review`.
- Sidebar link.
- Frontend API client for review queue.
- Page header + summary cards shell.

Acceptance criteria:

- Protected admin route loads queue data.
- Loading, error, and empty states render.

Implementation notes:

- Added `ConceptTextReviewPage` at `/admin/text-review` inside the protected admin layout.
- Added **Text Review** sidebar link between Concept Texts and Audio Review.
- Added frontend types and `getConceptTextReviewQueue()` API client.
- Page includes header, refresh action, three summary cards, and `AdminDataTable` loading/empty handling.
- Non-empty state shows a phrase-first preview list until S022.3 adds filters, table, and mobile cards.

Verification:

```bash
cd frontend
npm run lint
npm run build
```

Result: passed.

### S022.3 - Review Table And Mobile Cards

Status: Done

Goal: Phrase-first reviewer layout on desktop and mobile.

Scope:

- Filters wired to API.
- Desktop table + mobile cards (reuse admin table/card patterns from Audio Review and Concept Completion).
- Reference text display.
- Pagination.

Acceptance criteria:

- Reviewers can scan and paginate the queue on phone and desktop.
- Heritage phrase is visually primary.

Implementation notes:

- Added `ConceptTextReviewReferenceTexts` and `ConceptTextReviewMobileCard` components.
- Wired review status, local language, and search filters to the review-queue API with reset support.
- Replaced the preview list with a phrase-first desktop table and stacked mobile cards.
- Added pagination via `AdminDataTable`; approve/reject/edit actions remain for S022.4.

Verification:

```bash
cd frontend
npm run lint
npm run build
```

Result: passed.

### S022.4 - Approve, Reject, And Edit Actions

Status: Done

Goal: Complete the review loop without leaving the queue when possible.

Scope:

- Wire approve/reject via existing concept text update API.
- **One-click reject** — no modal, no note (reuse `ConceptTextQuickReviewButtons` pattern).
- Edit deep link to Concept Texts with `edit=<id>`.

Acceptance criteria:

- Approve and one-click reject update row and refresh queue.
- Edit opens Concept Texts form with context.

Implementation notes:

- Added `ConceptTextReviewActions` for desktop and mobile approve, one-click reject, and edit link.
- Wired `updateConceptText()` from the review page with success notice and queue refresh.
- Edit deep links to `/admin/content/concept-texts?edit=<id>`.

Verification:

```bash
cd frontend
npm run lint
npm run build
```

Result: passed.

### S022.5 - Tests, Docs, And Stabilization

Status: Done

Goal: Verify and document the workflow.

Scope:

- Backend tests for review-queue endpoint.
- Frontend lint/build.
- Update slice board and API docs.

Acceptance criteria:

- Relevant backend tests pass.
- Frontend lint and build pass.
- Slice board reflects Done when complete.

Implementation notes:

- Review-queue backend coverage from S022.1 remains in `tests/test_concept_texts.py` (six tests).
- Re-ran focused review-queue tests and full backend `pytest` (81 passed).
- Re-ran frontend `npm run lint` and `npm run build`.
- API docs for `GET /api/admin/concept-texts/review-queue` shipped in S022.1.
- Parent slice **S022** marked Done on slice board.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_concept_texts.py -k review_queue
.venv/bin/pytest
```

Result: passed, `6 passed` review-queue; `81 passed` full suite.

```bash
cd frontend
npm run lint
npm run build
```

Result: passed.

## Recommended Build Order

1. S022.1
2. S022.2
3. S022.3
4. S022.4
5. S022.5

## Files Likely Touched

**Backend**

- `backend/app/routes/concept_text_routes.py` (or new route module)
- `backend/app/schemas/concept_text_schema.py`
- `backend/tests/test_concept_texts.py`
- `docs/api/concept-texts-api.md`

**Frontend**

- `frontend/src/features/conceptTexts/pages/ConceptTextReviewPage.tsx` (new)
- `frontend/src/features/conceptTexts/api/conceptTextsApi.ts`
- `frontend/src/features/conceptTexts/types/conceptText.types.ts`
- `frontend/src/components/admin/AdminSidebar.tsx`
- Admin router file registering `/admin/text-review`
- Reuse: `ConceptTextReviewBadge`, `ConceptTextQuickReviewButtons`, `AdminDataTable`, `AdminFilterBar`, `StatsCard`

## Test Plan

**Backend**

```bash
cd backend
.venv/bin/pytest tests/test_concept_texts.py -k review_queue
.venv/bin/pytest
```

Cover: auth, default local-language + needs_review filter, English/French exclusion, language filter, search, pagination, referenceTexts population, ordering.

**Frontend**

```bash
cd frontend
npm run lint
npm run build
```

Manual QA:

1. Seed or create a Médumba concept text in `needs_review`.
2. Open `/admin/text-review` — row appears with EN/FR reference when available.
3. Approve — row leaves default queue; completion status improves.
4. One-click reject — row leaves default queue; rejected filter shows it; Completion dashboard shows blocked state.
5. Confirm English/French texts in `needs_review` do **not** appear in the queue.
6. Mobile width — phrase-first card layout, actions reachable.

## Builder Handoff

- **This chat = planner only.** Implement one child slice per agent run (start with **S022.1**).
- **Do not merge** Text and Audio review UIs in S022.
- Prefer **Option A** dedicated review-queue endpoint for parity with audio.
- Match **Audio Review** layout conventions (`ConceptTextAudioReviewPage.tsx`) but bind to **concept text** entities.
- Keep Concept Texts CRUD and Completion quick actions unchanged.
- Ask the human about a new branch before coding (per `AGENTS.md`).

## Resolved Product Decisions (Human, 2026-05-22)

1. **Reject:** one-click reject is fine for v1 — no note, no confirmation dialog.
2. **Language scope:** local/heritage languages only (Médumba, future Duala, Fefe, Bassa, etc.). English and French are never queue rows; they may appear only as reference context.
3. **Status filter:** include approved/rejected/draft history via review status filter, matching Audio Review.

**Still open for builder (low priority):** none — status filter for approved/rejected history is included (same as Audio Review).

## Planner Verification

Planner/doc-only slice. No backend or frontend checks required beyond reviewing the markdown changes.
