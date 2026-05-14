# Multi-Agent Orchestration Manual

> Version: v1.1
> Last updated: 2026-05-14

## 1. Purpose

This repo uses a **file-based multi-agent workflow** so different CLI agents can collaborate without direct agent-to-agent APIs.

Use one **main task file** and let the **role** decide the output location.

---

## 2. Directory Layout

```text
docs/agents/
  MANUAL.md
  shared-context.md
  decisions.md
  tasks/
  results/
  reviews/
  examples/

scripts/
  dispatch.ps1
  dispatch.sh
```

---

## 3. Core Convention

### Main task

- `docs/agents/tasks/TASK-001.md`

### Output by role

- `implementer` -> `docs/agents/results/TASK-001-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-001-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-001-validation-<agent>.md`
- `planner` -> `docs/agents/results/TASK-001-<agent>.md`

This means you usually **do not** create:

- `TASK-001-review.md`
- `TASK-001-validation.md`

unless review/planning/validation is large enough to deserve its own separate task scope.

---

## 4. Execution Model

This workflow is **sequential by default**.

Normal order:

1. create main task
2. run implementer
3. write implementation result
4. run reviewer on the same task id
5. write review output
6. run verifier on the same task id if needed
7. write validation output
8. then start the next main task

Do **not** start review before the implementation result exists unless the task is explicitly independent.

---

## 5. File Types

### `shared-context.md`

Shared source of truth for all agents.

### `tasks/TASK-XXX.md`

Defines:

- objective
- owned files
- forbidden files
- required output
- validation

### `results/TASK-XXX-<agent>.md`

Used by implementers and planners.

### `results/TASK-XXX-validation-<agent>.md`

Used by verifiers.

### `reviews/TASK-XXX-review-<agent>.md`

Used by reviewers.

### `decisions.md`

Stores project-level decisions.

---

## 6. Ownership Rules

- One main task should have one clear objective.
- One write scope should have one agent at a time.
- Reviewers should not silently expand implementation scope.
- If assumptions conflict with repo reality, record them in output.
- Always list touched or reviewed files.

---

## 7. PowerShell Usage

### Create a new main task

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\dispatch.ps1 `
  -Command new-task `
  -TaskId TASK-001 `
  -Agent codex `
  -Role implementer `
  -Title "Add GLB support"
```

### Show prompt for implementer

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\dispatch.ps1 `
  -Command show-prompt `
  -TaskId TASK-001 `
  -Agent codex `
  -Role implementer
```

### Show prompt for reviewer

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\dispatch.ps1 `
  -Command show-prompt `
  -TaskId TASK-001 `
  -Agent gemini `
  -Role reviewer
```

### Show prompt for verifier

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\dispatch.ps1 `
  -Command show-prompt `
  -TaskId TASK-001 `
  -Agent cursor `
  -Role verifier
```

---

## 8. Shell Usage

### Create a new main task

```bash
./scripts/dispatch.sh new-task TASK-001 codex implementer "Add GLB support"
```

### Show prompt for implementer

```bash
./scripts/dispatch.sh show-prompt TASK-001 codex implementer
```

### Show prompt for reviewer

```bash
./scripts/dispatch.sh show-prompt TASK-001 gemini reviewer
```

### Show prompt for verifier

```bash
./scripts/dispatch.sh show-prompt TASK-001 cursor verifier
```

---

## 9. Recommended Sequential Workflow

### Step 1 — Implementation

- create `TASK-001`
- run implementer
- write `results/TASK-001-<agent>.md`

### Step 2 — Review

- keep the same `TaskId`
- run reviewer
- write `reviews/TASK-001-review-<agent>.md`

### Step 3 — Validation

- keep the same `TaskId`
- run verifier
- write `results/TASK-001-validation-<agent>.md`

### Step 4 — Next Main Task

- use `TASK-002`
- repeat the same lifecycle

---

## 10. Reference Rules

### Every task should usually reference

- `docs/agents/shared-context.md`
- its own main task file

### A reviewer should usually also reference

- the main task file
- the implementation result
- the code or docs under review

Example:

- review of `TASK-001` should reference:
  - `docs/agents/tasks/TASK-001.md`
  - `docs/agents/results/TASK-001-codex.md`
  - relevant code files

### A verifier should usually also reference

- the main task file
- the implementation result
- the review output
- relevant plan/status docs

Example:

- validation of `TASK-001` should reference:
  - `docs/agents/tasks/TASK-001.md`
  - `docs/agents/results/TASK-001-codex.md`
  - `docs/agents/reviews/TASK-001-review-gemini.md`
  - `docs/session/2026-05-14-task-order.md`

### The next main task should usually reference

- `docs/agents/shared-context.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-14-task-order.md`
- the previous task's validation output

Short rule:

- **review references implementation**
- **validation references implementation + review**
- **next main task references previous validation + plan docs**

---

## 11. Which File Guides The Next Main Task?

When creating the next main task, the source of truth is:

1. `docs/plan/current-status.md`
2. `docs/plan/phase1-checklist.md`
3. `docs/session/2026-05-14-task-order.md`
4. previous validation output

Do **not** let the previous task file alone decide the next roadmap step.

---

## 12. When To Use Separate Review/Validation Tasks

Only create separate task files like:

- `TASK-001-review.md`
- `TASK-001-validation.md`

when those are large independent work items with their own scope.

Default mode is simpler:

- one main task
- same task id
- role-based output

---

## 13. When To Use Subagents

Use subagents only **inside one platform/runtime** when available.

Use this rule:

- **shell/files for cross-platform**
- **subagents for in-platform parallelism**

---

## 14. Anti-Patterns

Avoid these:

- multiple agents editing the same files at the same time
- starting review before implementation artifacts exist
- assigning vague ownership
- relying only on chat logs instead of output files
- letting different agents work from different repo truths

---

## 15. Recommended Next Actions For This Repo

1. `TASK-001` — Codex adds GLB support
2. `TASK-001` with role `reviewer` — Gemini or Cursor reviews patch
3. `TASK-001` with role `verifier` — validate readiness for Gate 2
4. `TASK-002` — plan Gate 2 stress testing
