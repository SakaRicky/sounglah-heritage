# S005 - Landing Page

## Epic

Epic 2 - Public Experience

## Status

Done

## Goal

Build the public Sounglah landing page for parents, families, and visitors.

## Product Direction

The landing page should communicate:
- heritage language preservation
- children learning their mother language
- family connection
- speaking with parents and grandparents
- warm African/Cameroonian cultural identity

## Non-Goals

- Do not implement auth.
- Do not implement admin CRUD.
- Do not connect real lesson data yet.

## Suggested Sections

- Hero section
- Family/heritage value proposition
- How it works
- Language support starting with Médumba
- Parent-focused call to action
- Login button for admins

## Acceptance Criteria

- Landing page is public.
- It feels warm and family-centered.
- It does not look like a generic SaaS landing page.
- It has a clear login/admin entry point.
- “Explore our languages” uses a horizontal scroll strip (snap on small screens; chevron scroll from `md`) with a “View all languages” link to `/languages`; Médumba is the only active CTA until more languages ship (child slice **SS009**).
- Middle feature band (mint background, three cards) and shared stories content: child slice **SS010**.
