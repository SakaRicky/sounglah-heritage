# S024 - Concept Audio Completion Gate

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Slice Type

Hotfix implementation slice.

## Goal

Make approved heritage-language audio a required part of concept readiness, so a concept cannot be published for families until its required local-language text has approved current audio.

Sounglah is built around children hearing and speaking with parents, grandparents, and community. For Médumba and future heritage languages, text alone is not enough learning content. Families should not reach a published concept-backed lesson item where the core heritage phrase has no playable approved pronunciation.

## Product Decision

Do **not** block `ConceptText.status = active` when audio is missing.

`active` remains an admin/content visibility flag so translators, reviewers, and recorders can create an active text row, review it, record audio, submit audio, replace rejected audio, and see missing-audio states in the Concept Texts table.

Instead, add audio to the readiness gate:

```text
A required heritage-language concept text counts as complete only when:

1. the language is active,
2. the language is required for concept completion,
3. the language requires concept text review,
4. the concept text is active,
5. the concept text review status is approved,
6. the concept text has an approved current audio record.
```

For MVP this means Médumba. For future local languages, the rule follows `languages.requires_concept_text_review = true`.

English and French support-language texts do not require audio for completion unless a future product decision adds support-language audio.

## Current Repo Context

- S014 added `concept_text_audios` and `concept_texts.current_audio_id`.
- Approved audio becomes the current playable audio for a concept text.
- S021 added concept completion and guarded concept publishing.
- S021 currently requires active texts and approved heritage text review, but does not require approved audio.
- S022 gives reviewers a focused text review queue.
- S023 lesson publish guards require active concept-backed lesson items to link published concepts.
- S023 public payload resolves Médumba audio from `current_audio_id`.

## Required Behavior

### Concept completion

Update the completion service so each required language summary can report audio readiness.

Recommended additions to completion rows:

```json
{
  "languageCode": "med",
  "hasText": true,
  "textStatus": "approved",
  "textId": "uuid",
  "requiresAudio": true,
  "hasApprovedAudio": false,
  "audioStatus": "missing"
}
```

Recommended `audioStatus` values:

| Status | Meaning |
| --- | --- |
| `not_required` | Support language or language not requiring audio for completion. |
| `missing` | No current approved audio exists. |
| `pending_review` | A submitted audio exists but is not approved yet. |
| `rejected` | Latest relevant audio was rejected and there is no current approved audio. |
| `approved` | `current_audio_id` points to an approved audio record. |

### Completion statuses

Add a new completion status:

```text
needs_audio
```

Recommended priority order:

1. Missing required text -> `needs_translation`
2. Rejected required text -> `has_rejected_text`
3. Draft required text -> `draft`
4. Required text needing review -> `needs_review`
5. Required heritage audio missing/pending/rejected -> `needs_audio`
6. All required text and audio ready, unpublished -> `complete`
7. All required text and audio ready, published -> `published`

### Concept publish guard

`POST /api/admin/concepts/:id/publish` must reject concepts with missing required heritage audio.

Recommended error shape addition:

```json
{
  "error": {
    "message": "Concept cannot be published because required texts are missing, not approved, or missing approved audio."
  },
  "missingLanguages": [],
  "draftLanguages": [],
  "needsReviewLanguages": [],
  "rejectedLanguages": [],
  "needsAudioLanguages": ["med"]
}
```

### Lesson publish guard

No new lesson-level DB rule is required if lesson publish continues to require published concepts.

Because a concept cannot be published without approved heritage audio, S023 lesson publish automatically inherits the audio requirement for concept-backed lesson items.

Still keep learner/player missing-audio UI as a defensive fallback for old data, local dev seed gaps, or future admin mistakes.

## Backend Implementation Plan

Recommended child slices:

### S024.1 - Completion Service Audio Gate

Status: Done

Scope:

- Extend `calculate_concept_completion()` to inspect concept text audio readiness.
- Add `needs_audio` completion status.
- Add `needsAudioLanguages` to service output.
- Add per-language `requiresAudio`, `hasApprovedAudio`, and `audioStatus`.
- Keep support languages unaffected.
- Add unit tests for missing, pending, rejected, and approved audio cases.

Potential DB impact:

- No migration is expected if `concept_texts.current_audio_id` and `concept_text_audios.status` already support the rule.
- If tests reveal the current model cannot efficiently determine pending/rejected latest audio, use existing `concept_text_audios` rows before adding any new column.

Implementation notes:

- Added `needs_audio` completion status.
- Added `needsAudioLanguages` to completion output.
- Added per-language `requiresAudio`, `hasApprovedAudio`, and `audioStatus`.
- Required heritage/local languages use `requires_concept_text_review = true` as the audio gate.
- No migration was needed; the implementation reuses `concept_texts.current_audio_id` and `concept_text_audios.status`.

### S024.2 - Concept Publish Guard And API Docs

Status: Done

Scope:

- Update concept publish endpoint to return `needsAudioLanguages` when blocked.
- Update completion list/summary API responses to include `needs_audio`.
- Update `docs/api/concepts-api.md` and any completion API docs.
- Add backend tests for publish rejection when Médumba text is approved but audio is missing.

Potential DB impact:

- No migration expected.
- If existing test fixtures create approved text without audio and publish concepts, update fixtures intentionally.

Implementation notes:

- Concept publishing now returns `needsAudioLanguages` when approved heritage text is missing approved audio.
- Completion summary and status filtering include `needs_audio`.
- Concept API docs include the new status, per-language audio fields, and publish blocker shape.

### S024.3 - Admin Completion UI Audio State

Status: Done

Scope:

- Add `needs_audio` to frontend completion types, labels, filters, badges, summary cards, and publish disabled reasons.
- Show a quick action from a missing-audio language badge to Concept Texts recording mode or the filtered Concept Text row.
- Use warm, clear copy: audio is needed so children can hear the phrase before a concept reaches families.
- Update English and French i18n strings for any new user-facing copy.

Implementation notes:

- Completion types, filters, summary cards, status badges, language badges, publish disabled reasons, and primary fix actions now understand `needs_audio`.
- Missing/rejected audio links back to the filtered Concept Text row for recording/replacement.
- Pending audio links to the Audio Review queue.

### S024.4 - Lessons Docs And Defensive Player Copy

Status: Done

Scope:

- Confirm S023 docs and public player behavior say missing audio is defensive fallback, not normal published-content state.
- If player copy already exists by then, make sure the missing-audio message fits the new rule.
- Avoid blocking young learners from continuing; publishing, not player navigation, is the quality gate.

Implementation notes:

- S023 docs now call out S024 before relying on published concepts for learner-facing audio.
- Lesson publish detail messages include missing approved audio when a linked concept is not publish-ready.

## Acceptance Criteria

- A Médumba concept text may be active without audio so recording workflows remain usable.
- A concept with approved required text but no approved Médumba audio is not ready to publish.
- Completion dashboard can distinguish `needs_audio` from text translation/review problems.
- Concept publish API returns a clear `needsAudioLanguages` blocker.
- Published lessons can rely on published concepts having approved heritage audio.
- Existing support-language text completion remains unchanged.
- Backend tests cover the new readiness gate before code is considered done.

## Non-Goals

- Requiring audio for English or French.
- Preventing admins from activating concept text rows before audio exists.
- Combining text review and audio review into one queue.
- Changing audio upload or Cloudinary storage behavior.
- Hard-gating learner progress on listening.
- Adding child accounts, progress, scoring, or speech assessment.

## Risks And Notes

- This is a readiness rule, not a content creation rule. Blocking `active` would make batch recording harder and would conflict with the existing S014 missing-audio table states.
- Existing seeded or test concepts may become unpublishable until approved audio fixtures are added.
- Old published concepts created before this rule may need a one-time audit if the database already contains published concepts without audio.
- The implementation should reuse the existing audio history/current-audio model before adding schema. A DB migration should only happen if the current model cannot express or query the needed state cleanly.

## Verification Plan

Backend:

```bash
cd backend
.venv/bin/pytest tests/test_concept_completion_service.py
.venv/bin/pytest tests/test_concepts.py
.venv/bin/pytest
```

Frontend, if UI is touched:

```bash
cd frontend
npm run lint
npm run build
```

## Verification

```bash
cd backend
.venv/bin/pytest tests/test_concept_completion_service.py tests/test_concepts.py
```

Result: passed, `40 passed`.

```bash
cd backend
.venv/bin/pytest
```

Result: passed, `126 passed`.

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run lint
```

Result: passed with existing Fast Refresh warnings in `frontend/src/features/lessons/utils/lessonItemTypeVisual.tsx`.

```bash
cd frontend
source ~/.nvm/nvm.sh
nvm use 22.15.0
npm run build
```

Result: passed. Vite reported the existing large chunk/plugin timing warnings.
