# Concept Image Upload with Cloudinary

Status: Done

Slice ID: None provided by human.

## Goal

Allow admins to optionally upload, replace, describe, and remove an image for each Concept using backend/server-side Cloudinary uploads.

## Implementation Notes

- Added nullable Concept image fields: `image_url`, `image_public_id`, and `image_alt_text`.
- Added an Alembic migration for those fields because the local model/schema did not yet include them.
- Added protected admin endpoints for image upload, alt text update, and image deletion.
- Upload validation allows only JPEG, PNG, and WebP files and enforces `MAX_IMAGE_UPLOAD_MB`.
- Cloudinary credentials are read only by the Flask backend.
- Media is separated by `CLOUDINARY_UPLOAD_ROOT`; concept images upload under `<CLOUDINARY_UPLOAD_ROOT>/concepts`.
- The React admin Concept form saves normal concept fields first, then runs image upload/delete/alt text calls.
- The Concept table shows a Cloudinary thumbnail when present, otherwise “No image.”

## Verification

- `cd backend && source .venv/bin/activate && pytest -q` passed: 33 tests.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npx eslint . -f json` passed with zero errors.
- `cd frontend && npm run build` was blocked locally because Node.js is `20.10.0`; Vite requires `20.19+` or `22.12+`.
- `cd frontend && npm run lint` was blocked locally by the same Node runtime incompatibility in the default ESLint formatter; JSON formatter passed.
