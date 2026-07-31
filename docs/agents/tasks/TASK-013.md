# TASK-013 — W8 Orphan Upload Placeholder Garbage Collection

## Metadata

- Task ID: `TASK-013`
- Default role: `planner`
- Suggested first agent: `codex`
- Status: `todo`
- Priority: `medium`

## Objective

Plan a W8 stability task that identifies and cleans up orphan `MediaAsset` upload placeholders left in `UPLOADED` state when the managed upload / derived flow is abandoned.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- Upload flow currently creates placeholder `MediaAsset` rows before the full asset lifecycle completes.
- Local and R2/S3-style storage concerns are already separated at the service layer.
- Storage key generation now uses UUID-style object keys, but orphan rows / objects are still a lifecycle concern.
- This is a **main task file**.
- Review and validation should reuse `Task ID = TASK-013` with different roles.

## Owned Files

- `docs/plan/TASK-013-plan.md`
- `docs/agents/results/TASK-013-<agent>.md`
- `docs/agents/reviews/TASK-013-review-<agent>.md`

## Role-Based Output Convention

- `planner` / `implementer` -> `docs/agents/results/TASK-013-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-013-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-013-validation-<agent>.md`

## Do Not Change

- `src/**`
- `pipeline/**`
- Existing W1–W4 archived task artifacts

## Inputs

- `docs/agents/shared-context.md`
- `docs/plan/pipeline-asset-flow.md`
- `docs/plan/current-status.md`
- `prisma/schema.prisma`
- `server/services/media-asset.service.ts`
- `server/storage/storage.service.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`

## Required Output

For the default role (`planner`):
- `docs/plan/TASK-013-plan.md`

Include:
- exact definition of an orphan placeholder in this repo
- safe cleanup rules for DB rows and backing storage objects
- age threshold / retention policy before GC runs
- whether GC should be:
  - on-demand script
  - cron / scheduled job
  - admin-only maintenance endpoint
- safeguards to avoid deleting:
  - valid in-progress uploads
  - derived assets
  - lineage-linked source assets still needed for audit/history
- recommended evidence / metrics to prove GC is safe in Phase 1

## Validation

- Reviewer should confirm the plan respects `MediaAsset` lineage semantics and does not propose deleting records that are still referenced by derived assets or experiences.
- Reviewer should check that storage-provider differences (`LOCAL`, `R2`, `S3`) are accounted for at the contract level.
- Any later implementer should be able to build the GC task without re-deciding policy.

## Notes

- This is a W8 stability task, not an immediate W5 blocker.
- Prefer conservative cleanup rules over aggressive deletion.
- Keep DB lineage correctness ahead of storage reclamation speed.
