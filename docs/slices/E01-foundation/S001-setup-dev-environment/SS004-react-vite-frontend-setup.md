# SS004 - React + Vite Frontend Setup

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Goal

Create or verify the React + Vite + TypeScript frontend structure.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Existing stack:** `frontend/` already had Vite, React, TypeScript, React Router, Tailwind-related PostCSS wiring, and app/router/pages.
- **Scope:** Ensure `npm run build` and `npm run lint` succeed on current tooling (TypeScript 6.x + ESLint 9.x + Tailwind major lines).

## Builder Summary (Completed)

- **`tsconfig.json`:** `moduleResolution` set to **`bundler`** (replaces deprecated `Node` / node10 for TypeScript 6+).
- **`package.json`:** `build` script is **`tsc --noEmit && vite build`** (avoids solution-style `tsc -b` without composite projects).
- **`src/vite-env.d.ts`:** `/// <reference types="vite/client" />` for `import.meta.env` and CSS side-effect modules.
- **`tailwindcss`:** Pinned to **`^3.4.17`** so PostCSS keeps using `tailwindcss: {}` (v4 would require `@tailwindcss/postcss`; SS005 can revisit an upgrade).
- **`eslint.config.js`:** Flat config for ESLint 9+ with `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`; **`globals`** devDependency for `globals.browser`.
- **Docs:** Root `README.md` and `frontend/README.md` mention `npm run build` / `npm run lint`.

## Acceptance Criteria

- [x] React + Vite + TypeScript app under `frontend/` with entry (`index.html`, `src/main.tsx`), router, and pages.
- [x] `npm run build` completes without errors.
- [x] `npm run lint` completes without errors.

## Test / Manual Checks

| Check | Result |
|-------|--------|
| `cd frontend && npm install && npm run build` | Pass |
| `npm run lint` | Pass |

## How you can verify locally

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`). Use **Ctrl+C** to stop.

## Suggested commit message

```text
fix(frontend): stabilize SS004 build (TS, ESLint flat config, Tailwind v3)

Add vite-env types, pin Tailwind 3 for PostCSS, eslint.config.js + globals,
tsconfig bundler resolution, and document build/lint in README.
```
