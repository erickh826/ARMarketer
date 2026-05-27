# TASK-005 — Plan implementation of Cloudflare R2 storage contract and MediaAsset lineage proof

## Metadata

- Task ID: `TASK-005`
- Default role: `planner`
- Suggested first agent: `codex`
- Status: `todo`
- Priority: `high`

## Objective

Define an implementation-ready plan for the first real managed asset flow after Gate 3: store large assets through Cloudflare R2 conventions, prove one source -> derived `MediaAsset` lineage path, and prepare the smallest next implementation task without expanding into full route integration yet.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- Gate 3 is now formally passed:
  - `docs/session/2026-05-15-gate3-report.md`
  - `docs/session/2026-05-15-gate3-evidence-note.md`
- Large binaries are a confirmed R2 target, but the exact contract is not yet operationalized in the running app flow.
- `MediaAssetService` already supports:
  - upload placeholder creation
  - derived asset creation
  - derived asset linkage
  - ready-asset resolution
- Example upload routes already exist under `server/examples/next-app-router/`, but they are still example-level and not yet the integrated app boundary.
- This task is a **planning task**, not the implementation itself.

## Owned Files

- `docs/agents/results/TASK-005-<agent>.md`
- `docs/session/2026-05-15-r2-lineage-implementation-plan.md`
- optional: `docs/agents/shared-context.md`

## Role-Based Output Convention

- `implementer` / `planner` -> `docs/agents/results/TASK-005-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-005-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-005-validation-<agent>.md`

## Do Not Change

- `src/**`
- `pipeline/**`
- `docs/agents/tasks/TASK-001*.md`
- `docs/agents/tasks/TASK-002*.md`
- `docs/agents/tasks/TASK-003*.md`
- `docs/agents/tasks/TASK-004*.md`

## Inputs

- `docs/agents/shared-context.md`
- `docs/agents/decisions.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/plan/pipeline-asset-flow.md`
- `docs/plan/phase_plan/phase1.md`
- `docs/session/2026-05-15-gate3-formalization-plan.md`
- `docs/session/2026-05-15-gate3-report.md`
- `server/services/media-asset.service.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- `prisma/schema.prisma`

## Required Output

- For the default role:
  - `docs/agents/results/TASK-005-<agent>.md`
- Also produce:
  - `docs/session/2026-05-15-r2-lineage-implementation-plan.md`
- Include:
  - the exact R2 storage split to implement first
  - the minimal `MediaAsset` state transition path to prove
  - whether the first proof should be doc-only, mock-backed, or route-backed
  - the proposed write scope for the first implementation task
  - acceptance criteria for that implementation task
  - the next main task ID that should execute the plan

## Validation

- Keep scope focused on R2 contract + lineage proof.
- Do not reopen Gate 3 acceptance or Gate 2 mobile validation.
- Prefer the smallest executable path that fits the current repo architecture.
- Use existing Prisma/service capabilities instead of proposing greenfield backend redesign.

## Notes

- Keep the plan implementation-oriented, not aspirational.
- If example-route assumptions conflict with service reality, record the mismatch.
- The next task should be concrete enough that an implementer can start editing files immediately.
