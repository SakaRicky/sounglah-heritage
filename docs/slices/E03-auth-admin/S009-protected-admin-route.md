# S009 - Protected Admin Route

## Epic

Epic 3 - Authentication + Admin Shell

## Status

Done

## Goal

Protect admin routes so unauthenticated users are redirected to `/login`.

## Acceptance Criteria

- `/admin` requires authentication.
- Missing or invalid token redirects to login.
- Auth logic is isolated and reusable.
