# Deployment

## Railway Backend Environment

Set these variables on the Railway backend service:

- `SECRET_KEY`
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_ROOT=sounglah/prod`
- `MAX_IMAGE_UPLOAD_MB=5`
- `MAX_AUDIO_UPLOAD_MB=5`
- `MAX_AUDIO_DURATION_SECONDS=30`

Railway Postgres commonly provides a `postgresql://` database URL. The backend normalizes
that URL to SQLAlchemy's `postgresql+psycopg://` dialect so the app uses the installed
psycopg v3 driver instead of looking for the legacy `psycopg2` package.

Run migrations before starting the app:

```bash
flask --app run.py db upgrade
```

## Render Backend Environment

Set these variables on the Render backend service:

- `SECRET_KEY`
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_ROOT=sounglah/prod`
- `MAX_IMAGE_UPLOAD_MB=5`
- `MAX_AUDIO_UPLOAD_MB=5`
- `MAX_AUDIO_DURATION_SECONDS=30`

Cloudinary uploads are handled by Flask. Do not add `CLOUDINARY_API_SECRET` or other Cloudinary secrets to Vercel or any `VITE_` frontend environment variable.

Use one upload root per environment, then let backend code derive media-specific folders:

- Local/dev: `CLOUDINARY_UPLOAD_ROOT=sounglah/dev`
- Staging: `CLOUDINARY_UPLOAD_ROOT=sounglah/staging`
- Production: `CLOUDINARY_UPLOAD_ROOT=sounglah/prod`

Concept images upload to `<CLOUDINARY_UPLOAD_ROOT>/concepts`.
Concept text audio uploads to `<CLOUDINARY_UPLOAD_ROOT>/concept-text-audios`.

## Vercel Frontend Environment

Set:

- `VITE_API_BASE_URL=https://<render-backend-host>/api`
