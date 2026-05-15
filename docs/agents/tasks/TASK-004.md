# TASK-004 — Formalize Gate 3 pipeline path and Cloudflare R2 asset strategy

## Metadata

- Task ID: `TASK-004`
- Default role: `planner`
- Suggested first agent: `codex`
- Status: `in_progress`
- Priority: `high`

## Objective

Formalize the Gate 3 execution path using the preliminary conversion evidence already captured, and define how large source/test assets should be handled through Cloudflare R2 instead of GitHub/Vercel-hosted static files.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- Gate 2 has desktop evidence but mobile validation is still blocked by device availability.
- Preliminary Gate 3 evidence already exists:
  - `docs/session/2026-05-15-gate3-preliminary-report.md`
  - `pipeline/output/20251228_004_RC_LOD0_opt.glb`
  - `public/test-assets/factory-lod0-opt.glb`
- The current machine did not have Docker available, so the preliminary conversion evidence used a Docker-free path.
- Very large GLB assets should not be treated as repo-native or Vercel-native static artifacts.
- The user intends to use **Cloudflare R2** for 100MB+ assets.

## Owned Files

- `docs/agents/results/TASK-004-<agent>.md`
- `docs/session/2026-05-15-gate3-formalization-plan.md`
- optional: `docs/agents/decisions.md`

## Role-Based Output Convention

- `implementer` / `planner` -> `docs/agents/results/TASK-004-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-004-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-004-validation-<agent>.md`

## Do Not Change

- `server/**`
- `prisma/**`
- `docs/agents/tasks/TASK-001*.md`
- `docs/agents/tasks/TASK-002*.md`
- `docs/agents/tasks/TASK-003*.md`

## Inputs

- `docs/agents/shared-context.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/plan/pipeline-asset-flow.md`
- `docs/plan/phase_plan/phase1.md`
- `docs/plan/validation.md`
- `docs/session/2026-05-15-gate3-preliminary-report.md`
- `docs/agents/suggestion/TASK-003-pipeline-suggestion-codex.md`
- `pipeline/run_convert.sh`
- `pipeline/scripts/convert.py`
- `pipeline/scripts/convert_trimesh.py`
- `pipeline/Dockerfile`
- `prisma/schema.prisma`
- `server/services/media-asset.service.ts`

## Required Output

- For the default role:
  - `docs/agents/results/TASK-004-<agent>.md`
- Also produce:
  - `docs/session/2026-05-15-gate3-formalization-plan.md`
- Include:
  - recommended official Gate 3 conversion path
  - whether Docker/Blender remains mandatory or fallback-supported
  - what evidence is still required for formal Gate 3 acceptance
  - how Cloudflare R2 should be used for large source/test assets
  - what stays in repo vs what moves to R2
  - the next smallest executable task after this planning step

## Validation

- Keep Gate 3 scope distinct from Gate 2 mobile validation.
- Use the preliminary conversion evidence as an input, not as final acceptance by itself.
- Treat Cloudflare R2 as the default destination for large binaries that should not live in GitHub/Vercel.
- Produce a plan that is executable with the current repo architecture and docs.

## Notes

- This is a formalization/planning task, not the final Gate 3 acceptance itself.
- Prefer a practical split between local dev convenience and production-safe asset storage.
