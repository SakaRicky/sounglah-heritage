# SS006 - Cursor Rules Setup

## Parent Slice

S001 - Setup Dev Environment

## Status

Done

## Goal

Add project rules for product direction, coding standards, and agent workflow.

## Non-Goals

- Do not build unrelated features.
- Do not over-design future schema.
- Do not implement admin CRUD yet.

## Planner Notes

- **Existing content:** Rules already existed as `.md` files without Cursor metadata.
- **Scope:** Align with Cursor’s recommended **`.mdc` + YAML frontmatter`** format, merge in monorepo paths (`backend/`, `frontend/`), Tailwind `@apply` / flat token note, and pointers to `docs/` for workflow.

## Builder Summary (Completed)

- **Replaced** `.cursor/rules/*.md` with **`.mdc`** rules:
  - **`sounglah-product.mdc`** — `alwaysApply: true`; product users, tone, visual system pointers.
  - **`coding-standards.mdc`** — `globs: "**/*.{ts,tsx,js,py,css,md}"`; Flask/React/Tailwind conventions, `backend/` + pytest + `python3` venv note, flat Sounglah color keys.
  - **`agent-workflow.mdc`** — `alwaysApply: true`; Planner → Builder → Reviewer, slice docs, `docs/slice-board.md`, `docs/definition-of-done.md`, `docs/prompts/`.
- **Removed** legacy `.md` copies to avoid duplicate or ignored rules.

## Acceptance Criteria

- [x] Product, coding, and workflow guidance exist under `.cursor/rules/`.
- [x] Rules use the supported `.mdc` format with descriptions / apply scope.
- [x] Content matches current repo layout and practices.

## Test / Manual Checks

| Check | Result |
|-------|--------|
| Three `.mdc` files present; no stray `.md` rule files | Pass |
| Manual: Cursor loads project rules in a new chat | Human verify |

## Suggested commit message

```text
chore(cursor): SS006 migrate rules to .mdc with frontmatter

Replace legacy .md rules; document monorepo paths, slice workflow, and
Tailwind token conventions for agents.
```
