# TASK-002 — Design Gate 2 stress test and report record

## Metadata

- Task ID: `TASK-002`
- Role: `planner`
- Assigned agent: `gemini`
- Status: `todo`
- Priority: `high`

## Objective

- Produce a concrete Gate 2 test plan and report structure for large-asset viewer validation after `TASK-001` is completed and validated.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- `TASK-001` addresses the GLB viewer gap.
- Gate 2 is not yet formally passed because no measured stress-test record exists.
- `docs/plan/current-status.md` and `docs/plan/phase1-checklist.md` both treat Gate 2 evidence as missing.
- This is a **main task**. Later review/validation should reuse the same `TaskId` (`TASK-002`) with different roles.

## Owned Files

- Planner default output:
  - `docs/agents/results/TASK-002-gemini.md`

## Role-Based Output Convention

- `planner` / `implementer` -> `docs/agents/results/TASK-002-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-002-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-002-validation-<agent>.md`

## Do Not Change

- `src/**`
- `server/**`
- `prisma/**`
- `pipeline/**`

## Inputs

- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-14-task-order.md`
- `docs/agents/results/TASK-001-validation-gemini.md`
- `src/components/ModelViewer.tsx`

## Required Output

- For planner role:
  - `docs/agents/results/TASK-002-gemini.md`
- Include:
  - test scope
  - device/browser matrix suggestion
  - metrics to capture
  - pass/fail thresholds
  - recommended report file structure

## Validation

- plan must align with Gate 2 in the project docs
- plan should be executable without inventing unrelated scope
- clearly separate measurable evidence from subjective impressions

## Notes

- This is the main task after `TASK-001` lifecycle is complete.
- Later review of this plan should use:
  - `TaskId = TASK-002`
  - `Role = reviewer`
- Later validation of this plan should use:
  - `TaskId = TASK-002`
  - `Role = verifier`
- Keep output usable as the direct basis for the next execution task.
