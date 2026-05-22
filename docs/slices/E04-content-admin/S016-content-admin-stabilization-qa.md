# S016 - Content Admin Stabilization + QA

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Goal

Run a focused stabilization pass before Lessons so the language, concept, concept text, approved content, audio, and seed/import foundations are reliable enough to build lesson CRUD and learner flows on top of them.

This slice is intentionally not a polish pass or a full production-hardening pass. Fix only blockers and data-integrity regressions that would multiply during Lessons work.

## Scope

- Verify admin CRUD flows for languages, concepts, concept images, and concept texts.
- Verify the concept text audio upload, recording, history, review, approve, reject, current-audio, and mini-player flows.
- Check data consistency around missing text, missing audio, duplicate concept/language text pairs, disabled records, status changes, and filters.
- Check seed/import sanity for Médumba, English, French, concepts, and concept text relationships.
- Confirm backend and frontend checks, including the local Node/Vite build gate.

Out of scope for this slice:

- Full role-based permissions.
- Password reset, refresh tokens, or production auth hardening.
- Complete admin i18n.
- UI polish beyond issues that block content QA.
- Advanced learner analytics.

## QA Checklist

### Admin CRUD

- [x] Create language.
- [x] Edit language.
- [x] Disable and re-enable language.
- [x] Create concept.
- [x] Upload concept image.
- [x] Remove concept image.
- [x] Edit concept category, difficulty, and status.
- [x] Create concept text for concept and language.
- [x] Change concept text review status.
- [x] Disable and re-enable concept text.
- [x] Filter and search language, concept, and concept text lists.

### Audio Workflow

- [x] Record audio inline.
- [x] Upload audio.
- [x] View audio history.
- [x] Approve audio.
- [x] Reject audio.
- [x] Confirm approved audio becomes current audio.
- [x] Confirm rejected audio does not become current audio.
- [x] Confirm mini player works after refresh.
- [x] Confirm review queue updates after approve/reject.

### Data Consistency

- [x] Concept with no text does not break admin lists.
- [x] Concept text with no audio shows a safe missing-audio state.
- [x] Duplicate concept text for the same concept and language is rejected.
- [x] Disabled concepts and concept texts do not appear where they should be hidden.
- [x] Filters update correctly after status and review-status changes.

### Seed Data Sanity

- [x] Seed files include no concept text rows pointing at missing concepts.
- [x] Seed importer skips duplicate concept/language pairs instead of inserting duplicates.
- [x] Médumba, French, and English rows are consistent enough for early Lessons.
- [x] Concepts are not too messy or duplicated for the first lesson set.

## Baseline Findings

- Backend automated checks pass: `54 passed` from `backend/.venv/bin/pytest`.
- Frontend lint passes: `npm run lint`.
- Frontend build initially failed under the active local runtime, Node `20.10.0`.
- Switching through `nvm` to the repo-pinned Node `22.15.0` resolved the runtime issue and the frontend build passes.
- Seed CSV sanity check found:
  - `429` concept rows.
  - `1009` concept text rows.
  - concept text language counts: `en=492`, `med=492`, `fr=25`.
  - `0` concept text rows pointing at missing concepts.
  - `108` duplicate concept/language pairs in the CSV input. This does not create duplicate database rows because `seed_concept_texts()` skips existing pairs, but the duplicate source rows should be cleaned before Lessons depend on the seed set.

## Implementation Notes

- No backend API or database changes were needed from the initial automated stabilization pass.
- The build blocker was environmental, not a repo-config gap: the required Node version is already documented in version files and `package.json`.
- Manual browser QA passed for admin CRUD, audio workflow, data consistency, and seed sanity. No blocker fixes were needed before Lessons.

## Verification

```bash
cd backend
.venv/bin/pytest
```

Result: passed.

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
