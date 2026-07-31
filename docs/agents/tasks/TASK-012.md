# TASK-012 — CMS Concurrency Hardening for Experience / Hotspot Writes

## Metadata

- Task ID: `TASK-012`
- Default role: `planner`
- Suggested first agent: `codex`
- Status: `todo`
- Priority: `high`

## Objective

Define the minimal Phase 1 hardening plan for lost-update prevention and compare-and-swap write guards on CMS-style editing flows, starting with `ARExperience` and `Hotspot` updates.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- The repo now contains a hotspot baseline: schema, API routes, and a React editor scaffold already exist.
- Current hotspot/editor close-out work is tracked in `TASK-011`.
- Existing concurrency analysis already exists in `docs/issue_upgrade/concurrency.md`.
- Current known weak point: editor-style writes are still effectively last-write-wins.
- This is a **main task file**.
- Review and validation should reuse `Task ID = TASK-012` with different roles.

## Owned Files

- `docs/plan/TASK-012-plan.md`
- `docs/agents/results/TASK-012-<agent>.md`
- `docs/agents/reviews/TASK-012-review-<agent>.md`

## Role-Based Output Convention

- `planner` / `implementer` -> `docs/agents/results/TASK-012-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-012-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-012-validation-<agent>.md`

## Do Not Change

- `src/**`
- `pipeline/**`
- Existing W1–W4 archived task artifacts

## Inputs

- `docs/agents/shared-context.md`
- `docs/issue_upgrade/concurrency.md`
- `docs/agents/tasks/TASK-011.md`
- `docs/plan/TASK-011-plan.md`
- `docs/plan/current-status.md`
- `prisma/schema.prisma`
- `server/services/ar-experience.service.ts`
- `server/services/hotspot.service.ts`
- `server/examples/next-app-router/app/api/experiences/[id]/route.ts`
- `server/examples/next-app-router/app/api/hotspots/[id]/route.ts`

## Required Output

For the default role (`planner`):
- `docs/plan/TASK-012-plan.md`

Include:
- exact concurrency model to use for Phase 1
- whether to use `version` column, `updatedAt`, or another optimistic-lock token
- expected HTTP behavior for stale writes (`409 Conflict`)
- affected schema / service / route / UI contract surfaces
- rollout order for:
  - hotspot PATCH
  - experience PATCH
  - any related editor save flows
- explicit non-goals to avoid scope creep into unrelated pipeline/worker hardening

## Validation

- Reviewer should confirm the plan is consistent with `docs/issue_upgrade/concurrency.md` and scoped to CMS editing flows, not the entire backend.
- Reviewer should check that the plan clearly separates:
  - editor lost-update hardening
  - bind / compile / pipeline concurrency
- Any later implementer should be able to execute the plan without reopening basic design questions.

## Notes

- This task is about **planning the hardening work**, not implementing the schema changes yet.
- Prefer the smallest defensible Phase 1 approach over a broad concurrency redesign.
- Record any mismatch between `TASK-011` close-out assumptions and current repo reality.
