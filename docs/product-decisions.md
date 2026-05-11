# Product Decisions

This file stores important decisions so future Cursor agents do not restart the same discussions.

## Decision 1: Product Positioning

Sounglah is positioned as a heritage language learning platform for diaspora families, not a generic translation app.

## Decision 2: First Language

The first language is Médumba.

## Decision 3: Multi-Language Future

The app should be designed so more languages can be added later without rewriting the entire system.

## Decision 4: MVP Scope

The MVP should not copy all of Duolingo. It should focus on short, practical, family-centered learning experiences.

## Decision 5: Early Build Order

Early build order:
1. Foundation
2. Public landing page
3. Login/admin shell
4. Admin CRUD
5. Learner experience

## Decision 6: Frontend Stack

Use React + Vite + TypeScript + Tailwind.

## Decision 7: Backend Stack

Use Flask for the backend server.

## Decision 8: Agent Workflow

Use three default agents:
1. Planner
2. Builder
3. Reviewer

Specialist agents should be used only when necessary.
