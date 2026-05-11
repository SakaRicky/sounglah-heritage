# Architecture Notes

## Current Direction

Sounglah will start as a monorepo with two main apps:

```text
backend/   Flask API
frontend/  React + Vite app
```

## Backend

The backend uses Flask with:
- application factory pattern
- blueprints for routes
- config through environment variables
- services folder for business logic as complexity grows
- models folder for database models later
- schemas folder for validation/serialization later

Early backend should start with:
- health endpoint
- auth routes later
- language routes later
- concept routes later
- lesson routes later

## Frontend

The frontend uses:
- React
- Vite
- TypeScript
- Tailwind
- React Router

Early frontend should start with:
- public layout
- landing page
- login page
- admin layout
- protected admin route later

## API Prefix

Use:

```text
/api
```

Example:

```text
GET /api/health/
GET /api/languages
POST /api/languages
```

## Early Database Strategy

During setup, avoid over-designing the schema.

A possible future direction:
- Language
- Concept
- ConceptText
- Lesson
- LessonItem
- User

But the exact schema should be refined slice by slice.
