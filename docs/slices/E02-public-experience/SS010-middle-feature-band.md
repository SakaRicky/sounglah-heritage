# SS010 - Middle feature band (landing)

## Parent

S005 - Landing page (Epic 2 - Public Experience)

## Status

Done

## Goal

Add the mint-background **middle feature band** on the landing page with three cards—continue learning (placeholder progress), stories & culture (featured thumbnail + short list + CTA to the full stories page), and daily goal (compact KPI + CTA)—backed by shared static story content for easy additions later.

## Scope

- `frontend/src/content/stories.ts` — `LandingStory` type, `LANDING_STORIES`, `formatStoryMeta`, `FEATURED_STORY_ID`, `getFeaturedStory`, `getStoriesPreview`.
- `frontend/src/components/public/MiddleFeatureBand.tsx` — full-width `bg-mint-band`, inner `.section`, three cards; Stories CTA → `/stories-cultures`; list links support `#storyId` deep links.
- `frontend/src/components/public/StoryCard.tsx` — shared card used by landing `#stories` grid and catalog page.
- `frontend/src/pages/public/StoriesCulturesPage.tsx` — catalog page; hash scroll to story `id`.
- `frontend/src/app/router.tsx` — route `stories-cultures` under `PublicLayout`.
- `frontend/src/components/layout/Navbar.tsx` — “Stories” → `/stories-cultures`; unified `navItemTo` / `isItemActive` for hash vs path links.
- `frontend/tailwind.config.js` — `mint.band` set to `#F2F5ED` (reference palette).

## Out of scope

- Real lesson / learner progress APIs.
- CMS for stories.
- Redesign of hero, explore languages, about, blog, or landing `#stories` section layout/copy (beyond `StoryCard` extraction).

## Assumptions

- Placeholder progress and daily goal numbers are static until learner data exists (S005 non-goals).
- Adding stories is a **data-only** change to `LANDING_STORIES`; optional `FEATURED_STORY_ID` controls the middle-card hero image.

## Checks run

- `cd frontend && npm run build`
- `cd frontend && npm run lint`

## Files touched

- `frontend/src/content/stories.ts` (new)
- `frontend/src/components/public/MiddleFeatureBand.tsx` (new)
- `frontend/src/components/public/StoryCard.tsx` (new)
- `frontend/src/pages/public/LandingPage.tsx` (import `StoryCard`, drop inline card)
- `frontend/src/pages/public/StoriesCulturesPage.tsx` (new)
- `frontend/src/app/router.tsx`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/tailwind.config.js`
- `docs/slices/E02-public-experience/SS010-middle-feature-band.md` (this file)
