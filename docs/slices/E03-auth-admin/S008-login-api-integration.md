# S008 - Login API Integration

## Epic

Epic 3 - Authentication + Admin Shell

## Status

Backlog

## Goal

Connect the login form to the Flask backend auth endpoint.

## Non-Goals

- Do not build full user management yet.
- Do not over-engineer roles.

## Acceptance Criteria

- Login form can submit credentials.
- Successful login stores token.
- Failed login shows a friendly error.
- Successful login routes to `/admin`.
