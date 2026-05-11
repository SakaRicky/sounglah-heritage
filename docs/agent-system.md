# Sounglah Agent System

## Goal

Create a repeatable development system where one slice moves from idea to done without losing control.

## Default Agent Structure

```text
You = Product Owner + Final Reviewer

Agent 1: Planner / Architect
Agent 2: Builder
Agent 3: Reviewer / QA
```

## Optional Specialist Agents

Use only when needed:

```text
Agent 4: Data / Schema Specialist
Agent 5: UI / Design Specialist
```

## Default Workflow

```text
Planner → Builder → Reviewer → You approve → Commit
```

## Responsibilities

### Planner / Architect

The Planner:
- inspects the repo
- understands the slice
- defines scope
- identifies files to touch
- documents assumptions
- creates acceptance criteria
- creates a Builder handoff

The Planner does not code.

### Builder

The Builder:
- reads the Planner handoff
- implements only the slice
- keeps changes minimal
- follows existing patterns
- runs checks
- summarizes changed files

### Reviewer / QA

The Reviewer:
- checks correctness
- checks scope control
- checks build/test status
- checks security risks
- checks acceptance criteria
- approves or rejects the slice

### Human Owner

You:
- decide product direction
- approve tradeoffs
- review final output
- commit only when comfortable

## Recursive Slice Rule

A big feature is an epic.
A slice is a small shippable piece.
A child slice is a smaller task inside a parent slice.

Use folders for parent slices with multiple child slices.

### One SS per chat (enforced in Cursor rules)

- Treat each **child slice** (**SS###**) as a single unit of work per **Cursor chat** or **agent run** unless you are only continuing the same SS after review.
- Do not implement multiple SS files in one chat (for example SS001–SS008 together). Start a **new chat** for the next SS so Planner → Builder → Reviewer stays traceable.
- Details: **`.cursor/rules/agent-workflow.mdc`**.

Example:

```text
docs/slices/E01-foundation/S001-setup-dev-environment/
  00-overview.md
  SS001-repo-audit.md
  SS002-create-folder-structure.md
```

Use one markdown file for simple slices.

Example:

```text
docs/slices/E02-public-experience/S005-landing-page.md
```

## Definition

A slice is too large if:
- it touches too many unrelated files
- it cannot be tested in one session
- the Builder starts making architecture decisions
- you cannot explain what changed in one paragraph

When that happens, split the slice.
