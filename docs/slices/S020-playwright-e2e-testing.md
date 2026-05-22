# S020 - Playwright E2E Testing Setup

## Status

Done

## Scope

Add a first Playwright E2E test setup for the frontend so public experience regressions are caught automatically.

## Implementation Notes

- Add Playwright test dependencies and npm scripts under `frontend/`.
- Add a frontend-local `playwright.config.ts` that starts the Vite dev server for tests.
- Add initial smoke coverage for the public landing page, language page navigation, locale switching, and login navigation.

## Out of Scope

- Backend-seeded admin CRUD E2E flows.
- CI workflow wiring.
- Visual snapshot testing.

## Verification

- `npm run lint` from `frontend/` with Node 22.15.0: pass.
- `npm run build` from `frontend/` with Node 22.15.0: pass.
- `npm run test:e2e` from `frontend/` with Node 22.15.0: pass, 6 tests across desktop Chromium and mobile Chrome.
