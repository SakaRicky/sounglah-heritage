# Sounglah documentation

Use this map when you return to the project or onboard a new contributor.

## Product and architecture

| Doc | Purpose |
|-----|---------|
| [project-brief.md](./project-brief.md) | Vision, users, MVP direction, stack |
| [product-decisions.md](./product-decisions.md) | Recorded decisions agents should not reopen |
| [architecture-notes.md](./architecture-notes.md) | Monorepo layout, API prefix, frontend direction |
| [agent-system.md](./agent-system.md) | Planner / Builder / Reviewer workflow |
| [definition-of-done.md](./definition-of-done.md) | When a slice counts as done + commands to run |

## Planning

| Doc | Purpose |
|-----|---------|
| [slice-board.md](./slice-board.md) | Epics, slice status, current phase |
| [slices/](./slices/) | Per-slice specs (`00-overview.md` for parent slices) |
| [slices/E04-content-admin/S024-concept-audio-completion-gate.md](./slices/E04-content-admin/S024-concept-audio-completion-gate.md) | **Hotfix:** approved heritage audio required for concept readiness |
| [slices/E05-lessons/00-overview.md](./slices/E05-lessons/00-overview.md) | **Epic 5:** Lessons + lesson items MVP (S023, Greeting Grandma) |
| [prompts/](./prompts/) | Planner, Builder, Reviewer prompt templates |
| [SS008 verify (S001)](./slices/E01-foundation/S001-setup-dev-environment/SS008-verify-dev-commands.md) | Record of last `pytest` / `npm run build` / `npm run lint` verification |

## Design

| Doc | Purpose |
|-----|---------|
| [design/README.md](./design/README.md) | Where to put UI reference screenshots |

## Cursor agents

Project rules live in **`.cursor/rules/*.mdc`** (product, coding standards, agent workflow).
