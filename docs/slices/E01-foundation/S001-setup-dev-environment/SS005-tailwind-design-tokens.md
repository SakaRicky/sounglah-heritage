# SS005 - Tailwind and Base Design Tokens

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Goal

Configure Tailwind and define basic Sounglah design tokens.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Brand:** Warm, family-centered heritage learning (`docs/project-brief.md`) — cream/sand/cocoa/terracotta/leaf palette already sketched in code.
- **Screenshots:** If you add reference images under `docs/design/`, a follow-up can nudge hex values, shadows, and type scale to match pixels without re-scoping this slice.

## Builder Summary (Completed)

- **`frontend/tailwind.config.js`:** Nested Sounglah palette — **green** (primary CTAs), **cream** (canvas), **earth** / **gold** / **clay** (warm accents), **ink** (type). **Playfair Display** (`font-display`) + **Inter** (`font-sans`). Radii `rounded-card`, `rounded-button`, `rounded-sounglah`. Shadows `shadow-soft`, `shadow-card`, `shadow-floating`. Background **`bg-hero-warm`**. `maxWidth.measure` for copy blocks.
- **`frontend/src/styles/index.css`:** Google Font `@import` (Inter + Playfair), `@tailwind` layers, base body/heading styles, component utilities **`.section`**, **`.card`**, **`.btn-primary`**, **`.btn-secondary`**.
- **`frontend/index.html`:** Fonts load from CSS (no duplicate link tags).
- **Marketing UI:** Navbar, landing hero (`bg-hero-warm`), languages/stories/about sections, login card — aligned with green-primary / cream / earth system.
- **`docs/design/README.md`:** Optional screenshot references for future pixel tuning.

## Token map (source of truth: `frontend/tailwind.config.js`)

| Scale | Role |
|--------|------|
| `sounglah-green-*` (50–900) | Primary actions, success, lesson progress |
| `sounglah-cream-*` (50–200) | Page warmth, subtle sections |
| `sounglah-earth-*` | Borders, traditional brown tone, sand-like fills |
| `sounglah-gold-*` | Accent highlights (optional) |
| `sounglah-clay-*` | Warm terracotta accent (optional) |
| `sounglah-ink-*` (500–900) | Body and headline text |

Utilities: **`bg-hero-warm`**, **`shadow-soft` / `shadow-card` / `shadow-floating`**, **`rounded-card` / `rounded-button` / `rounded-sounglah`**, **`.btn-primary`** (green CTA), **`.btn-secondary`** (outline green).

## Acceptance Criteria

- [x] Tailwind extended with a documented Sounglah palette and shared shadows.
- [x] Global base styles use tokens (no stray hard-coded body colors in `:root` outside Tailwind).
- [x] Primary marketing and admin placeholders consume the same system.

## Test / Manual Checks

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run lint` | Pass |

## Suggested commit message

```text
feat(frontend): SS005 Sounglah Tailwind tokens and base styles

Extend palette, Inter + @layer base, brand shadows; align admin/login/landing
with tokens; add docs/design for future screenshot references.
```
