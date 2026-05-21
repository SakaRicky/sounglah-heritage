# S014 - Concept Text Audio Recording + Review

## Epic

Epic 4 - Content Admin CRUD  
or  
Epic 5 - Learning Media Management

## Status

Review / High Priority

## Goal

Allow authorized Sounglah users to quickly record audio pronunciations for concept texts directly from the Concept Texts table, without opening the full edit modal.

This is important because audio pronunciation is core learning content, especially for Médumba and other heritage languages.

## Main User Problem

The current Concept Texts page shows records in a table and has an Audio column showing `No audio`. If a recorder has to open a modal for every concept text, recording 800+ audios will be slow and frustrating.

The user should be able to:

```text
See concept text
Click Record
Speak the pronunciation
Preview it
Retake if needed
Submit it for review
Move to the next concept text
```

## Recommended Product Direction

Do not treat audio as a small field inside the existing edit form.

Audio should have its own workflow:

```text
Concept Text table = overview and quick actions
Inline recorder = fast one-by-one recording
Recording Mode = batch recording for many phrases
Review Queue = quality control before audio becomes official
```

---

# Overall UX Design

## Current table problem

The table currently has:

```text
Concept
Language
Text
Audio
Review
Status
Updated
Actions
```

The Audio column only says:

```text
No audio
```

This should become an interactive cell.

## New Audio Column States

### 1. Missing audio

```text
No audio
[Record]
```

### 2. Local recording in progress

The row expands inline:

```text
Recording: wū ze b'a ywimd’àm

[Stop recording]  00:04
[Cancel]
```

### 3. Recording preview

```text
[Play] 00:04
[Retake] [Submit for Review]
```

### 4. Pending review

```text
Pending review
[Play] [Replace]
```

### 5. Approved audio

```text
Approved
[Play] [Replace]
```

### 6. Rejected audio

```text
Rejected
[Record again]
```

Only one row should be in recording mode at a time.

---

# Main Slice Breakdown

## S014.1 - Audio Data Model + Migration

Status: Review

### Goal

Add proper database support for concept text audio files, review status, history, and current approved audio.

### Why this matters

Do not store only one `audio_url` directly on `concept_texts`. That is too limited because the system needs:

```text
recording history
pending review
approval
rejection
replacement
review notes
who recorded the audio
who approved it
```

### Recommended schema

Add a new table:

```sql
concept_text_audios
```

Suggested fields:

```text
id
concept_text_id
audio_url
audio_public_id
storage_provider
duration_seconds
file_size_bytes
mime_type
status
recorded_by_user_id
reviewed_by_user_id
review_note
created_at
updated_at
submitted_at
approved_at
rejected_at
```

Recommended `status` values:

```text
draft
pending_review
approved
rejected
archived
```

Also add to `concept_texts`:

```text
current_audio_id
```

This points to the currently approved audio that should be used in lessons.

### Important rule

A concept text can have many audio attempts, but only one current approved audio.

Example:

```text
Concept Text: "Who can help me?"
Language: Médumba
Text: wū ze b'a ywimd’àm

Audio attempts:
1. rejected
2. approved, old
3. approved, current
```

### Acceptance criteria

```text
- [x] concept_text_audios table exists.
- [x] concept_texts has nullable current_audio_id.
- [x] Each audio belongs to one concept text.
- [x] Audio history is preserved.
- [x] Approved audio can become the current audio for a concept text.
- [x] Rejected audio does not become current.
```

Implementation notes:

- Added `ConceptTextAudio` with draft, pending review, approved, rejected, and archived statuses.
- Kept legacy `concept_texts.audio_url` for compatibility; future slices should move table display toward `current_audio_id` and audio summaries.
- Added `ConceptText.set_current_audio(audio)` to enforce that only approved audio from the same concept text becomes current.
- Verification: from `backend/`, `.venv/bin/pytest` passes.

---

## S014.2 - Audio Storage Service

Status: Review

### Goal

Create a backend service responsible for receiving audio files, validating them, uploading them to storage, and returning metadata.

### Recommended storage

Use Cloudinary for now, since the project is already planning to use Cloudinary for concept images.

Store:

```text
audio_url
audio_public_id
duration_seconds
mime_type
file_size_bytes
storage_provider
```

### Backend behavior

The frontend should not directly save audio metadata to the database.

Recommended flow:

```text
Frontend records audio blob
Frontend sends multipart/form-data to backend
Backend validates user permission
Backend validates file type and size
Backend uploads to Cloudinary
Backend saves audio record in database
Backend returns saved audio metadata
```

### File validation

For concept text audio, keep recordings short.

Recommended limits:

```text
Max duration: 30 seconds
Preferred duration: 1-10 seconds
Max file size: 5 MB for MVP
Accepted types: webm, mp3, wav, m4a, ogg depending on browser support
```

The browser may produce different formats depending on device and browser, so the backend should not assume only one audio type.

### Acceptance criteria

```text
- [x] Backend storage service accepts validated audio file objects.
- [x] Backend rejects oversized audio files.
- [x] Backend rejects unsupported file types.
- [x] Backend rejects recordings over the configured duration limit.
- [x] Backend uploads audio to Cloudinary storage.
- [x] Backend returns metadata needed for concept_text_audios.
- [ ] Authenticated upload endpoint stores audio metadata in concept_text_audios. Deferred to S014.3.
- [ ] Upload failure does not create broken database records. Deferred to S014.3 transaction handling.
```

Implementation notes:

- Added `concept_text_audio_storage.upload_concept_text_audio`.
- Added `MAX_AUDIO_UPLOAD_MB` and `MAX_AUDIO_DURATION_SECONDS` backend config.
- Added Cloudinary audio uploads under `<CLOUDINARY_UPLOAD_ROOT>/concept-text-audios` using `resource_type="video"`, which is Cloudinary's audio-compatible upload resource type.
- Accepted MIME types include WebM, MP3/MPEG, WAV, M4A/MP4, AAC, and OGG to support browser differences.
- Verification: from `backend/`, `.venv/bin/pytest` passes.

---

## S014.3 - Audio API Endpoints

Status: Review

### Goal

Expose clean admin API endpoints for recording, listing, reviewing, approving, rejecting, and replacing concept text audios.

### Recommended endpoints

```http
POST /api/admin/concept-texts/:conceptTextId/audios
```

Uploads a new audio recording.

For MVP, this can immediately create the audio with:

```text
status = pending_review
```

Request:

```text
multipart/form-data
audio: File
duration_seconds: number
```

Response:

```json
{
  "id": "audio-id",
  "concept_text_id": "concept-text-id",
  "audio_url": "...",
  "duration_seconds": 4,
  "status": "pending_review"
}
```

---

```http
GET /api/admin/concept-texts/:conceptTextId/audios
```

Gets audio history for one concept text.

---

```http
GET /api/admin/concept-text-audios/review-queue
```

Gets audios waiting for review.

Useful filters:

```text
language_id
concept_id
recorded_by_user_id
status=pending_review
```

---

```http
PATCH /api/admin/concept-text-audios/:audioId/approve
```

Approves audio and sets it as the current audio for that concept text.

Important backend behavior:

```text
- Set audio status to approved.
- Set concept_texts.current_audio_id = audioId.
- Set reviewed_by_user_id.
- Set approved_at.
```

---

```http
PATCH /api/admin/concept-text-audios/:audioId/reject
```

Rejects an audio.

Request body:

```json
{
  "review_note": "Pronunciation needs to be clearer."
}
```

---

```http
DELETE /api/admin/concept-text-audios/:audioId
```

Optional for MVP.

Use carefully. Prefer `archived` instead of hard delete.

### Acceptance criteria

```text
- [x] Recorder can upload audio.
- [x] Reviewer/admin can approve audio.
- [x] Reviewer/admin can reject audio with a note.
- [x] Approved audio becomes the current playable audio.
- [x] Rejected audio remains in history but is not used in lessons.
- [x] API responses include enough information for the table Audio column.
```

Implementation notes:

- Added `POST /api/admin/concept-texts/:conceptTextId/audios`.
- Added `GET /api/admin/concept-texts/:conceptTextId/audios`.
- Added `GET /api/admin/concept-text-audios/review-queue`.
- Added `PATCH /api/admin/concept-text-audios/:audioId/approve`.
- Added `PATCH /api/admin/concept-text-audios/:audioId/reject`.
- Uploads are saved as `pending_review`; approve sets `concept_texts.current_audio_id`.
- Rejection preserves history and clears `current_audio_id` if the rejected audio was current.
- Verification: from `backend/`, `.venv/bin/pytest` passes.

---

## S014.4 - Concept Text Table Audio Summary

Status: Review

### Goal

Update the Concept Texts list endpoint so the frontend can show audio status without making one request per row.

### Problem to avoid

Do not load 891 concept texts and then call:

```text
GET /concept-texts/:id/audios
```

891 times.

That will be slow.

### Recommended response shape

The concept text list should include an `audio_summary`.

Example:

```json
{
  "id": "concept-text-id",
  "concept": {
    "id": "concept-id",
    "key": "help_request_title",
    "name": "Who can help me?"
  },
  "language": {
    "id": "language-id",
    "code": "med",
    "name": "Médumba"
  },
  "text": "wū ze b'a ywimd’àm",
  "review_status": "needs_review",
  "status": "active",
  "audio_summary": {
    "status": "missing",
    "current_audio_id": null,
    "current_audio_url": null,
    "pending_audio_id": null,
    "pending_audio_url": null,
    "duration_seconds": null
  }
}
```

Possible `audio_summary.status` values:

```text
missing
pending_review
approved
rejected
```

### Acceptance criteria

```text
- Concept Text table can display audio status from the list endpoint.
- No extra request is needed for each table row.
- Filters can later use audio status.
```

Implementation notes:

- Added `audioSummary` and `audio_summary` to the admin concept text list response.
- The list endpoint now fetches audio attempts for the visible page in one query and derives missing, pending_review, approved, and rejected row summaries.
- Pending review takes precedence over an approved current audio so replacement recordings remain visible in the table.
- Updated the Concept Texts table type and Audio column to display the returned summary without loading per-row audio history.

---

## S014.5 - Inline Audio Recorder Component

Status: Review

### Goal

Build a reusable React component that records audio from the browser using the microphone.

### Component name

```text
InlineAudioRecorder
```

### Responsibilities

```text
Request microphone permission
Start recording
Stop recording
Show timer
Create audio preview
Play preview
Retake recording
Submit recording
Cancel recording
Handle permission errors
Handle unsupported browser errors
```

### Browser API

Use:

```text
navigator.mediaDevices.getUserMedia()
MediaRecorder
```

### UX behavior

When the user clicks `Record`:

```text
- Ask for microphone permission if needed.
- Expand the row.
- Show the concept text clearly.
- Show the language.
- Show the text to pronounce.
- Start recording only after permission is granted.
```

While recording:

```text
[Stop recording] 00:04
[Cancel]
```

After stopping:

```text
[Play] 00:04
[Retake] [Submit for Review]
```

### Important frontend rules

```text
- Only one active recording at a time.
- Disable other record buttons while recording.
- Do not upload until the user clicks Submit.
- Stop microphone stream when recording ends or cancels.
- Clean up object URLs to avoid memory leaks.
- Show clear error if microphone permission is denied.
```

### Acceptance criteria

```text
- User can record audio inline from the table.
- User can preview before submitting.
- User can retake before submitting.
- User can cancel without saving.
- User cannot accidentally record multiple rows at once.
- Upload starts only after Submit for Review.
```

Implementation notes:

- Added reusable `InlineAudioRecorder` using `navigator.mediaDevices.getUserMedia()` and `MediaRecorder`.
- Wired missing and rejected Médumba Concept Text table rows to record inline, preview locally, retake, cancel, and submit to the S014.3 upload endpoint.
- Added a typed multipart frontend upload helper for `POST /api/admin/concept-texts/:conceptTextId/audios`.
- Only one recorder can be active at a time; other record buttons are disabled while a row is recording or previewing.
- Kept table column definitions stable through active-recorder state changes so the browser permission prompt does not remount and reset the recorder UI.
- English and French rows continue to show audio status/playback but do not expose recording actions.
- Object URLs, timers, and microphone tracks are cleaned up on cancel, submit, retake, and unmount.
- Verification: from `frontend/`, `npm run typecheck` and `npm run lint` pass. `npm run build` remains blocked locally because Node 20.10.0 is below Vite's required Node 20.19+ / 22.12+.

---

## S014.6 - Concept Text Audio Cell

Status: Review

### Goal

Create a reusable table cell component that handles all audio states.

### Component name

```text
ConceptTextAudioCell
```

### Props

```ts
type ConceptTextAudioCellProps = {
  conceptTextId: string;
  languageName: string;
  conceptName: string;
  text: string;
  audioSummary: {
    status: "missing" | "pending_review" | "approved" | "rejected";
    currentAudioId?: string | null;
    currentAudioUrl?: string | null;
    pendingAudioId?: string | null;
    pendingAudioUrl?: string | null;
    durationSeconds?: number | null;
  };
  canRecord: boolean;
  canReview: boolean;
  onAudioSubmitted?: () => void;
};
```

### States to render

Missing:

```text
No audio
[Record]
```

Pending:

```text
Pending review
[Play] [Replace]
```

Approved:

```text
Approved
[Play] [Replace]
```

Rejected:

```text
Rejected
[Record again]
```

### Acceptance criteria

```text
- Audio column is no longer just static text.
- Audio actions are available directly in the table.
- The full edit modal is not required for recording audio.
- The component is reusable in future pages.
```

Implementation notes:

- Added reusable `ConceptTextAudioCell` for missing, pending review, approved, and rejected states.
- The Concept Texts table now delegates audio status, playback, and record/replace actions to `ConceptTextAudioCell`.
- Médumba rows can record missing audio, record again after rejection, and replace pending/approved audio; English and French rows do not expose recording actions.
- The cell uses current approved audio when available. Pending rows without a current approved audio show pending status without playback until S014.7/S014.9 provide pending audio URLs or history detail.
- Verification: from `frontend/`, `npm run typecheck` and `npm run lint` pass.

---

## S014.7 - Mini Audio Player

Status: Review

### Goal

Create a small audio player for table rows and review pages.

### Component name

```text
AudioPlayerMini
```

### UX

Keep it compact:

```text
[Play] 00:04
```

Do not use the browser's large default audio player in the table because it will make the table messy.

### Features

```text
Play
Pause
Show duration
Show loading state
Show error if audio cannot load
```

### Acceptance criteria

```text
- Approved and pending audios can be played from the table.
- Player is small enough for table usage.
- The same player can be reused in the review queue.
```

Implementation notes:

- Added reusable `AudioPlayerMini` with play/pause, loading, duration, and error states.
- Replaced native `<audio controls>` usage in the Concept Text audio cell and recorder preview with the compact player.
- The table still shows approved and pending audio without the browser's full player chrome.
- Verification: from `frontend/`, `npm run typecheck` and `npm run lint` pass.

---

## S014.8 - Recording Mode Page

Status: Review

### Goal

Create a focused batch recording experience for users recording many concept texts.

### Why this is needed

The table is good for admins, but a recorder working through hundreds of missing audios needs a faster flow.

### Route suggestion

```text
/admin/concept-texts/recording
```

or

```text
/admin/audio-recording
```

### Page layout

Top filters:

```text
Language: [Médumba]
Audio: [Missing only]
Review: [Needs audio]
Search: [...]
```

Main recording card:

```text
Concept: Who can help me?
Language: Médumba
Text: wū ze b'a ywimd’àm

[Record]
```

After recording:

```text
[Play] 00:04
[Retake] [Submit for Review]
```

After submit:

```text
Saved for review.
Moving to next item...
```

### Recommended behavior

```text
- Show one concept text at a time.
- After successful submit, automatically move to the next missing item.
- Provide Previous and Skip buttons.
- Show progress count: 12 of 240 missing Médumba audios.
```

### Acceptance criteria

```text
- Recorder can focus on one phrase at a time.
- Recorder can filter by language.
- Recorder can record missing audios quickly.
- Page automatically moves to next item after submit.
- User can skip difficult items.
```

Implementation notes:

- Added `/admin/content/concept-texts/recording` with an admin link from the Concept Texts page and a redirect from `/admin/audio-recording`.
- The recording queue is built from the existing concept text list endpoint and filtered client-side to missing Médumba rows.
- The page uses the existing inline browser recorder, auto-advances by reloading the queue after upload, and keeps recording controls disabled outside Médumba.

---

## S014.9 - Audio Review Queue

Status: Review

### Goal

Allow reviewers/admins to approve or reject submitted audio recordings.

### Route suggestion

```text
/admin/audio-review
```

### Review queue table columns

```text
Concept
Language
Text
Recorder
Audio
Submitted
Actions
```

On phones and tablets, the same queue should use stacked recording cards instead of forcing the desktop table to scroll horizontally.

Actions:

```text
[Play]
[Approve]
[Reject]
```

When rejecting:

```text
Reject audio
Reason:
[Pronunciation is unclear...]

[Cancel] [Reject]
```

### Approval behavior

When a reviewer approves an audio:

```text
- Audio status becomes approved.
- concept_texts.current_audio_id is updated.
- Audio becomes available for learning lessons.
```

### Rejection behavior

When a reviewer rejects an audio:

```text
- Audio status becomes rejected.
- Review note is saved.
- Concept text audio status becomes rejected or missing depending on whether there is another approved audio.
```

### Acceptance criteria

```text
- [x] Reviewer can see all pending audios.
- [x] Reviewer can play audio before deciding.
- [x] Reviewer can approve audio.
- [x] Reviewer can reject audio with a note.
- [x] Approved audio becomes the current concept text audio.
- [x] Rejected audio is not used in lessons.
```

Implementation notes:

- Added `/admin/audio-review` for the admin audio review queue.
- Added frontend helpers for the existing review queue, approve, and reject endpoints.
- The queue supports status and language filters, pagination, empty/loading/error states, and refresh.
- Reviewers can play submitted audio with `AudioPlayerMini`, approve pending audio, or reject with a review note.
- Phones and tablets now render submitted recordings as stacked review cards with concept, language, status, player, submitted metadata, recorder, and approve/reject actions; the table remains the desktop view.
- Added an Audio Review entry to the admin sidebar.
- Verification: from `frontend/`, `npm run typecheck` and `npm run lint` pass. `npm run build` remains blocked locally because Node 20.10.0 is below Vite's required Node 20.19+ / 22.12+.

---

## S014.10 - Permissions and Roles

Status: Review

### Goal

Control who can record, review, approve, reject, replace, and delete audio.

### Recommended permissions

Use permissions instead of hardcoding everything to `ADMIN`.

Suggested permissions:

```text
concept_text_audio:read
concept_text_audio:create
concept_text_audio:replace
concept_text_audio:review
concept_text_audio:approve
concept_text_audio:reject
concept_text_audio:archive
```

### Suggested roles

```text
Admin
Reviewer
Audio Contributor
Content Manager
```

### Role behavior

Audio Contributor:

```text
Can view concept texts
Can record audio
Can submit audio for review
Can replace their own pending audio if allowed
Cannot approve audio
Cannot edit concept text
Cannot delete concept text
```

Reviewer:

```text
Can listen to pending audio
Can approve audio
Can reject audio
Can add review notes
```

Admin:

```text
Can do everything
```

### MVP simplification

For the first version, it is acceptable to allow only admins to record and review.

But the code should be structured so permissions can be separated later.

### Acceptance criteria

```text
- [x] Unauthorized users cannot record audio.
- [x] Unauthorized users cannot approve/reject audio.
- [x] UI hides actions users cannot perform.
- [x] Backend also enforces permissions.
```

Implementation notes:

- MVP keeps concept text audio permissions admin-only, matching the current auth model.
- Added named backend permission gates for read, create, review, approve, reject, replace, and archive so future roles can plug into one place.
- Added frontend audio capability helpers and routed table recording, recording mode, and review queue actions through them.
- Full role separation for Audio Contributor, Reviewer, and Content Manager is deferred until the user/session model has roles.

---

## S014.11 - Filters and Search Improvements

### Goal

Make it easy to find concept texts that need audio.

### Add filters to Concept Texts page

```text
Language
Audio status
Review status
Concept
Search text
```

Audio status filter values:

```text
All
Missing audio
Pending review
Approved
Rejected
```

Recommended default for audio work:

```text
Language: Médumba
Audio status: Missing audio
```

### Acceptance criteria

```text
- User can filter concept texts by missing audio.
- User can filter pending audio.
- User can filter approved audio.
- User can search by concept text.
```

---

# Recommended Build Order

Do not build everything in one prompt.

Build in this order:

```text
1. S014.1 - Data model and migrations
2. S014.2 - Audio storage service
3. S014.3 - Audio API endpoints
4. S014.4 - Add audio_summary to concept text list
5. S014.7 - Mini audio player
6. S014.5 - Inline audio recorder
7. S014.6 - ConceptTextAudioCell integration
8. S014.9 - Review queue
9. S014.11 - Filters
10. S014.8 - Recording Mode page
11. S014.10 - Permissions hardening
```

The MVP should be:

```text
Data model
Upload audio
Inline record from table
Submit for review
Review approve/reject
Approved audio becomes current
```

Recording Mode can come immediately after MVP because it will make large-scale recording much faster.

---

# Overall Non-Goals

Do not include these in the first version:

```text
AI pronunciation scoring
Waveform editor
Audio trimming
Noise removal
Multi-speaker comparison
Mobile native recording app
Bulk audio import
Automatic translation validation
Lesson player integration beyond current_audio_id
```

These can come later.

---

# Definition of Done

This slice is complete when:

```text
- Authorized user can record audio from the Concept Texts table.
- Recording happens inline without opening the edit modal.
- User can preview and retake before submitting.
- Submitted audio is saved to storage.
- Audio metadata is saved in the database.
- Audio appears as pending review.
- Reviewer/admin can approve or reject audio.
- Approved audio becomes the current audio for that concept text.
- Concept Text table clearly shows missing, pending, approved, and rejected audio states.
- User can filter concept texts by audio status.
```

---

# Important Implementation Reminder for Agents

Do not turn the Concept Text edit modal into a giant media-management form.

The modal should remain for editing:

```text
concept
language
text
status
review metadata
```

Audio recording should be fast, inline, and optimized for repetition.

The best final structure is:

```text
Concept Texts table
  └── Audio column with quick record/play actions

Audio Recording Mode
  └── Fast batch recording flow

Audio Review Queue
  └── Approve/reject submitted recordings
```
