# SS009 - Explore languages landing section

## Parent

S005 - Landing page (Epic 2 - Public Experience)

## Status

Done

## Goal

Replace the landing languages grid with a horizontal “Explore our languages” strip (scroll-snap + optional chevrons from `md`), header-aligned “View all languages” link, consistent cards (thumbnail, title, descriptor, CTA), and a static `/languages` catalog page sharing the same content model.

## Scope

- Shared data: `frontend/src/content/languages.ts` (`HERITAGE_LANGUAGES`, availability, `ctaHref` for Médumba).
- UI: `LanguageHeritageCard`, `ExploreLanguagesSection`, `LanguagesPage`, router child `languages`.
- Médumba CTA → `/languages#medumba`; others show “Coming soon”.
- Mobile: horizontal snap strip (~85vw card + peek); desktop/tablet: ~4 cards (`md`) / ~5 (`lg`) visible widths with scroll when needed.

## Out of scope

- Real learner lesson routes.
- CMS / admin wiring for languages.

## Checks run

- `cd frontend && npm run build`
- `cd frontend && npm run lint`

## Notes

- `Navbar.tsx`: `closeMobileMenu` on route change is scheduled with `requestAnimationFrame` to satisfy `react-hooks/set-state-in-effect` (lint).

## Assumptions

- “Start learning” for Médumba lands on the public languages catalog with hash until a dedicated learn flow exists.
