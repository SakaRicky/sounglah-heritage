# S021 - Concept Completion Workflow

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Goal

Build an admin workflow that shows whether each language-independent concept has the required translated texts and whether those texts are approved enough to use in lessons.

Sounglah concepts only become useful to families when children can see and hear the idea across the languages they use with parents, grandparents, and community. This workflow helps admins find missing translations, review drafts, and publish only concepts that are ready.

## Current Repo Context

- Languages CRUD exists at `/api/admin/languages` and `/admin/content/languages`.
- Concepts CRUD exists at `/api/admin/concepts` and `/admin/content/concepts`.
- Concept Texts CRUD exists at `/api/admin/concept-texts` and `/admin/content/concept-texts`.
- `concept_texts` already enforces one primary text per concept and language with `UNIQUE(concept_id, language_id)`.
- `ConceptText.status` currently means visibility: `active` or `disabled`.
- `ConceptText.review_status` currently means text review state: `draft`, `needs_review`, or `approved`.
- S021 should extend `ConceptText.review_status` with `rejected`; it should not repurpose `ConceptText.status`.
- `Concept.status` currently means visibility: `active` or `disabled`.
- S021 should add `Concept.published_at` for publishing state instead of overloading the existing visibility status.

## Product Decisions

- Use this new slice ID: `S021`.
- Required languages are controlled by backend language data, not hardcoded in frontend.
- Add `languages.is_required_for_concept_completion`.
- Add `languages.requires_concept_text_review` for heritage languages that must be approved before completion.
- Seed English, French, and Médumba as required for concept completion.
- Only heritage/local languages (Médumba and future languages like Fefe, Bassa, Duala) require approved review for completion; English and French only require that active text exists.
- Keep `needs_review` as the review status name used by the existing codebase.
- Add `rejected` to `ConceptText.review_status`.
- Add `concepts.published_at`.
- A concept is published when `published_at` is not null.
- A concept is ready to publish only when every required active language has an active `ConceptText`, and every required language with `requires_concept_text_review` has `review_status = approved`.
- S024 tightens this rule for heritage languages: required languages with `requires_concept_text_review = true` must also have approved current audio before they count as complete or publishable.
- Completion APIs should use the existing admin API and frontend route conventions.

## Completion Statuses

Use these API status values:

| Status | Meaning |
| --- | --- |
| `needs_translation` | One or more required languages have no active concept text. |
| `has_rejected_text` | All required texts exist, but one or more required texts are rejected. |
| `draft` | All required texts exist, but one or more required texts are still draft. |
| `needs_review` | All required texts exist, but one or more required texts need review. |
| `complete` | All required texts exist and all required texts are approved. |
| `published` | Concept is complete and has `published_at`. |

Priority order:

1. Missing required text -> `needs_translation`
2. Rejected required text -> `has_rejected_text`
3. Draft required text -> `draft`
4. Required text needing review -> `needs_review`
5. All required text approved and unpublished -> `complete`
6. All required text approved and published -> `published`

Disabled concept texts should not count toward completion. Disabled languages should not be treated as required for completion until they are active again.

## Backend Contract

### Required Language Flag

Add to `languages`:

```text
is_required_for_concept_completion BOOLEAN DEFAULT FALSE NOT NULL
```

Expose it in the languages API as:

```json
{
  "isRequiredForConceptCompletion": true
}
```

The language create/edit API should accept this field, defaulting to `false` for new optional languages.

### Concept Text Review Status

Extend `ConceptText.review_status` allowed values:

```text
draft
needs_review
approved
rejected
```

Update validation, schema docs, frontend types, filters, and badges to include `rejected`.

### Concept Publishing

Add to `concepts`:

```text
published_at DATETIME NULL
```

Expose API fields:

```json
{
  "publishedAt": "2026-05-22T10:00:00Z",
  "isPublished": true
}
```

Publishing should be guarded on the backend.

Recommended endpoint:

```text
POST /api/admin/concepts/:id/publish
```

If the concept is incomplete:

```json
{
  "error": {
    "message": "Concept cannot be published because required texts are missing or not approved."
  },
  "missingLanguages": ["med"],
  "draftLanguages": [],
  "needsReviewLanguages": [],
  "rejectedLanguages": []
}
```

### Completion Service

Create centralized backend logic, recommended file:

```text
backend/app/services/concept_completion_service.py
```

The service should calculate completion from:

- The concept.
- Active required languages.
- Active concept texts for the concept.

It should return:

```json
{
  "completionStatus": "needs_translation",
  "isComplete": false,
  "isReadyToPublish": false,
  "missingLanguages": ["med"],
  "draftLanguages": [],
  "needsReviewLanguages": [],
  "rejectedLanguages": [],
  "languages": [
    {
      "languageId": "uuid",
      "languageCode": "en",
      "languageName": "English",
      "hasText": true,
      "textStatus": "approved",
      "textId": "uuid"
    }
  ]
}
```

### Completion API

Use existing admin route conventions:

```text
GET /api/admin/concepts/completion
GET /api/admin/concepts/completion/summary
```

List filters:

- `status`
- `language`
- `search`
- `page`
- `pageSize`

`language` should filter concepts missing or blocked for a required language code.

List response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Summary response:

```json
{
  "data": {
    "totalConcepts": 120,
    "needsTranslation": 35,
    "hasRejectedText": 4,
    "draft": 6,
    "needsReview": 18,
    "complete": 52,
    "published": 15
  }
}
```

## Frontend Contract

Use the existing admin route structure:

```text
/admin/content/concepts/completion
```

Place navigation under Concepts with a sub-nav tab (not a separate sidebar item):

```text
Concepts > Completion tab → /admin/content/concepts/completion
```

The dashboard should include:

- Page header.
- Summary cards.
- Search.
- Status filter.
- Required language filter.
- Desktop table.
- Mobile stacked cards.
- Pagination.

Table columns:

- Concept.
- Required language states.
- Status.
- Actions.

Language badges:

- Missing -> red.
- Draft -> neutral.
- Needs review -> yellow.
- Approved -> green.
- Rejected -> red.

Quick actions should link into existing admin routes where possible:

- Missing text -> `/admin/content/concept-texts?conceptId=<id>&languageId=<id>` or prefilled create behavior if added in the child slice.
- Needs review/rejected/draft text -> existing concept text edit/review flow.
- Ready concept -> publish action.
- Published concept -> view state only for the first pass.

## Child Slice Breakdown

### S021.1 - Required Language Flag

Status: Done

Goal: Add backend and frontend support for marking languages as required for concept completion.

Scope:

- Add migration and model field.
- Update language schema/API validation.
- Update seed data for `med`, `en`, and `fr`.
- Update frontend language types/forms/table if needed.
- Update language API docs.
- Add or update backend tests.

Acceptance criteria:

- Languages can be marked required for concept completion.
- Seeded English, French, and Médumba are required.
- Existing language CRUD still works.

Implementation notes:

- Added `languages.is_required_for_concept_completion`.
- Added an Alembic migration that defaults the flag to false and marks `en`, `fr`, and `med` as required.
- Updated language API serialization and validation with `isRequiredForConceptCompletion`.
- Updated language seed behavior so existing `en`, `fr`, and `med` records are marked required.
- Updated the language admin form, summary cards, and table to display and edit the flag.
- Updated language API docs and backend language tests.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_languages.py
```

Result: passed, `7 passed`.

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `55 passed`.

```bash
cd frontend
npm run lint
```

Result: passed.

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run build
```

Result: passed.

### S021.2 - Concept Text Rejected Review Status

Status: Done

Goal: Add text-level rejected review state.

Scope:

- Extend backend validation and DB constraint.
- Update concept text schema docs.
- Update frontend types, filters, badges, and form options.
- Add backend tests for rejected status.

Acceptance criteria:

- Admin can mark a concept text as rejected.
- Invalid review statuses are rejected.
- Existing draft, needs review, and approved flows still work.

Implementation notes:

- Extended `ConceptText.review_status` to allow `rejected`.
- Added an Alembic migration to update the `concept_texts_review_status_check` constraint.
- Updated concept text API validation and review-status filtering.
- Updated frontend concept text types, form options, filter options, labels, and badges.
- Updated concept text API docs.
- Added backend tests for invalid review status and rejected review-status filtering.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_concept_texts.py
```

Result: passed, `16 passed`.

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `57 passed`.

```bash
cd frontend
npm run lint
```

Result: passed.

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run build
```

Result: passed.

### S021.3 - Concept Published State And Publish Guard

Status: Done

Goal: Add concept publish state and backend enforcement.

Scope:

- Add `concepts.published_at`.
- Expose `publishedAt` and `isPublished` in concept API.
- Add publish endpoint.
- Use the completion service once S021.4 exists, or build a minimal guard if this slice is implemented after S021.4.

Acceptance criteria:

- Published concepts expose `publishedAt`.
- Incomplete concepts cannot be published.
- Complete concepts can be published.

Implementation notes:

- Added nullable `concepts.published_at`.
- Added an Alembic migration for `published_at`.
- Exposed `publishedAt` and `isPublished` in concept API responses.
- Added `POST /api/admin/concepts/:id/publish`.
- The publish endpoint uses `calculate_concept_completion()` and rejects incomplete concepts with missing, draft, needs-review, and rejected language code lists.
- Updated frontend concept types and concepts API docs.
- Added backend tests for publish authentication, incomplete publish rejection, and successful publishing.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_concepts.py
```

Result: passed, `19 passed`.

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `67 passed`.

```bash
cd frontend
npm run lint
```

Result: passed.

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run build
```

Result: passed.

### S021.4 - Completion Calculation Service

Status: Done

Goal: Centralize concept completion logic.

Scope:

- Add service under `backend/app/services/`.
- Calculate all status values and per-language summaries.
- Cover missing, rejected, draft, needs review, complete, and published cases with tests.

Acceptance criteria:

- Completion logic is not duplicated in routes.
- Unit tests cover the status priority order.

Implementation notes:

- Added `backend/app/services/concept_completion_service.py`.
- Added `get_active_required_languages()` to load active languages marked required for concept completion.
- Added `calculate_concept_completion(concept, required_languages, concept_texts)`.
- The service returns status, readiness, missing/draft/review/rejected language code lists, and per-language completion rows.
- Disabled required languages are excluded from completion.
- Disabled concept texts do not count toward completion.
- `concept.published_at` is read with `getattr` so S021.3 can add the real column without changing the service contract.
- Added `languages.requires_concept_text_review`. Seeded Médumba as review-required; English and French stay required but only need active text for completion/publish. Completion UI bulk review and quick actions apply to heritage languages only.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_concept_completion_service.py
```

Result: passed, `7 passed`.

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `64 passed`.

### S021.5 - Completion API Endpoints

Status: Done

Goal: Provide list and summary data for the dashboard.

Scope:

- Add `GET /api/admin/concepts/completion`.
- Add `GET /api/admin/concepts/completion/summary`.
- Support filters, search, and pagination.
- Add API docs and backend tests.

Acceptance criteria:

- Admin can fetch completion rows.
- Status, language, search, and pagination filters work.
- Summary counts match the same completion logic.

Implementation notes:

- Added `GET /api/admin/concepts/completion`.
- Added `GET /api/admin/concepts/completion/summary`.
- Completion rows merge base concept fields with the centralized completion service output.
- The completion list supports `status`, `language`, `search`, `page`, and `pageSize`.
- The `language` filter accepts active required language codes and returns concepts where that language is missing or not approved.
- Summary counts are calculated from the same centralized completion service.
- Updated the Concepts Admin API docs.

Verification:

```bash
cd backend
.venv/bin/pytest tests/test_concepts.py
```

Result: passed, `24 passed`.

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `72 passed`.

### S021.6 - Admin Route And Dashboard Shell

Status: Done

Goal: Add the admin dashboard page shell.

Scope:

- Add route `/admin/content/concepts/completion`.
- Add sidebar link.
- Add API client/types.
- Render page header, loading, empty, and error states.

Acceptance criteria:

- Route is protected inside the existing admin layout.
- Sidebar navigation works.
- Page can load API data.

Implementation notes:

- Added the protected `/admin/content/concepts/completion` route.
- Added the "Concept Completion" sidebar link under Content Management (later moved under Concepts sub-nav in S021.7).
- Added frontend completion API client functions and TypeScript types for list rows, language states, filters, and summary.
- Added the first dashboard shell with page header, summary cards, API loading, empty, and error states.
- The shell intentionally shows only a small workflow preview; filters, desktop table, mobile cards, language badges, and publish actions remain in later S021 child slices.

Verification:

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run build
```

Result: passed.

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run lint
```

Result: passed.

### S021.7 - Completion Table And Mobile Cards

Status: Done

Goal: Show completion health clearly on desktop and mobile.

Scope:

- Add summary cards.
- Add filters.
- Add desktop table.
- Add mobile card layout.
- Add language/status badges.

Acceptance criteria:

- Missing, draft, needs review, approved, and rejected language states are obvious.
- Mobile does not depend on a wide table.

Implementation notes:

- Removed the standalone sidebar link; added `ConceptsSubNav` tabs on both Concepts pages and kept Concepts highlighted for `/concepts/completion`.
- Replaced the three-card rollup with six clickable per-status summary cards driven by the completion summary API.
- Added `ConceptCompletionFilters` for search, completion status, required language, and clear filters.
- Added `ConceptCompletionStatusBadge`, `ConceptCompletionLanguageBadge`, and `ConceptCompletionTable` with dynamic required-language columns on desktop and stacked cards on mobile.
- Wired debounced list loading with pagination (default 20/page); actions column deferred to S021.8.

Verification:

```bash
cd frontend
npm run lint
```

Result: passed.

```bash
cd frontend
npm run build
```

Result: passed.

### S021.8 - Quick Actions And Publish UI

Status: Done

Goal: Let admins move quickly from the dashboard to fixes and publishing.

Scope:

- Add missing-text links.
- Add review/edit links.
- Add publish button for ready concepts.
- Show disabled publish reason for incomplete concepts.

Acceptance criteria:

- Quick action links include concept and language context.
- Publish is disabled in the frontend for incomplete concepts.
- Backend remains the source of truth for publish eligibility.

Implementation notes:

- Added `conceptCompletionQuickActions.ts` for concept-text deep links and publish-disabled reasons.
- Added `ConceptCompletionActionsCell` with publish button, primary fix link, and blocked-publish messaging.
- Per-language quick links (`Add text`, `Review`, `Fix rejected`, `Edit`) appear in language cells and route to Concept Texts with `conceptId`, `languageId`, and optional `action=create` or `edit=<textId>`.
- Added `publishConcept()` API client and wired publish handling on the completion page.
- Concept Texts page reads URL params to pre-filter and auto-open create/edit forms from completion links.

Verification:

```bash
cd frontend
npm run lint
```

Result: passed.

```bash
cd frontend
npm run build
```

Result: passed.

### S021.9 - Workflow Tests And Stabilization

Status: Done

Goal: Verify the end-to-end workflow.

Scope:

- Backend tests for completion API, summary, filters, and publish guard.
- Frontend build/lint.
- Add focused frontend tests only where existing test patterns make that practical.
- Update docs and slice board.

Acceptance criteria:

- Relevant backend tests pass.
- Frontend lint and build pass.
- Docs reflect the shipped workflow.

Implementation notes:

- Pinned test admin credentials and secret key in `create_app(testing=True)` so pytest no longer depends on local `.env` overrides.
- Added completion summary auth coverage, publish guard test for rejected heritage text, and `requiresConceptTextReview` assertions on language and completion list payloads.
- Verified existing completion list, summary, filter, service, and publish tests still pass.
- Frontend has no unit-test harness beyond Playwright public smoke tests; completion workflow verification stays on backend tests plus lint/build.
- Updated slice board and parent slice status to Done.

Verification:

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `75 passed`.

```bash
cd backend
.venv/bin/pytest tests/test_concepts.py tests/test_concept_completion_service.py tests/test_languages.py
```

Result: passed, `41 passed`.

```bash
cd frontend
npm run lint
```

Result: passed.

```bash
cd frontend
npm run build
```

Result: passed.

## Recommended Build Order

1. S021.1
2. S021.2
3. S021.4
4. S021.5
5. S021.3
6. S021.6
7. S021.7
8. S021.8
9. S021.9

Publishing depends on completion logic, so S021.3 can happen after S021.4 unless the builder intentionally adds a temporary minimal guard and refactors it into the service later.

## Out Of Scope

- Role-specific reviewer permissions.
- Bulk approve/reject.
- Lesson publishing.
- Learner-facing concept display changes.
- Required languages per lesson or per course.
- Audio completion requirements.

## Open Questions For Builder

- Should disabled required languages be excluded from completion, or should required languages be immutable while required? Current plan excludes disabled languages from completion.
- Should publishing be reversible in the first pass? Current plan only adds publish, not unpublish.
- Should missing-text quick actions open a prefilled modal on the Concept Texts page, or is a filtered link enough for the first frontend slice?

## Planner Verification

Planner/doc-only slice. No backend or frontend checks required beyond reviewing the markdown changes.
