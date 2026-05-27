# TASK-007 — Integrate example asset routes into a runnable W4 host

## Metadata

- Task ID: `TASK-007`
- Default role: `implementer`
- Suggested first agent: `codex`
- Status: `todo`
- Priority: `high`

## Objective

Wire the existing example asset routes into a runnable Express host so W4 upload and derived-asset registration flows can be exercised from one real server boundary instead of read-only example files.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- Gate 2 is accepted as `pass-with-warnings`; it is no longer the main blocker.
- Gate 3 is formally passed.
- `TASK-006` adds the missing derived-asset registration route inside `server/examples/next-app-router/`.
- The repo already has example route logic for:
  - source upload authorization
  - local upload byte serving
  - derived asset registration
  - project viewer payload resolution
- These routes are not currently mounted into any runnable host.
- `package.json` does not currently declare `express`, so an Express-based host integration task will need to account for that dependency explicitly.
- This task should stay focused on host integration, not pipeline execution, auth, or frontend viewer changes.
- This is a **main task**. Review and validation should reuse `Task ID = TASK-007` with different roles.

## Owned Files

- `docs/agents/results/TASK-007-<agent>.md`
- host integration files under a new or clearly scoped example-server boundary
- optional: `package.json`
- optional: server host bootstrap files and scripts required to run the host

## Role-Based Output Convention

- `implementer` -> `docs/agents/results/TASK-007-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-007-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-007-validation-<agent>.md`

## Do Not Change

- `src/**`
- `pipeline/**`
- `prisma/**`
- `server/services/**`
- `server/storage/**`
- `docs/agents/tasks/TASK-001*.md` through `TASK-006*.md`

## Inputs

- `docs/agents/shared-context.md`
- `docs/agents/decisions.md`
- `docs/agents/results/TASK-006-codex.md`
- `docs/session/2026-05-15-r2-lineage-implementation-plan.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`
- `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- `server/examples/next-app-router/app/api/projects/[slug]/experience/route.ts`
- `server/examples/next-app-router/lib/services.ts`
- `package.json`
- `tsconfig.server.json`

## Required Output

- Create a runnable host boundary that can expose at least:
  - `POST /api/assets/upload`
  - `PUT /uploads/*`
  - `GET /uploads/*`
  - `POST /api/assets/derived`
- If Express is chosen, add the minimal dependency and startup script needed to run it.
- Preserve existing service-layer usage; do not rewrite backend services.
- Produce `docs/agents/results/TASK-007-<agent>.md` documenting:
  - host entrypoint
  - routes mounted
  - scripts added
  - any environment variables required

## Acceptance Criteria

1. There is one runnable host entrypoint for the example asset flow.
2. Source upload authorization and derived asset registration can be exercised from the same host.
3. Local upload storage PUT/GET path is reachable from that host.
4. Existing service-layer logic remains the source of truth.
5. `typecheck:server` remains valid in a Node-capable environment.
6. Scope does not sprawl into frontend, pipeline execution, or auth.

## Validation

- Reviewer: check that the host integration is minimal, coherent, and keeps service boundaries intact.
- Verifier: check route reachability, startup script clarity, and no unnecessary scope expansion.

## Notes

- This task is about making the example flow runnable, not production-hardening it.
- If Express is added, keep the footprint small and document the dependency explicitly.
- If a lighter host approach is chosen instead, the implementer must justify why it is better than Express for this repo state.
