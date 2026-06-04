# TASK-008 — ImageTarget Management API Routes

## Metadata

- Task ID: `TASK-008`
- Default role: `implementer`
- Suggested first agent: `copilot`
- Status: `completed`
- Verified: `2026-06-04` by `gemini` (runtime smoke test PASS)
- Priority: `high`

## Objective

Expose the existing `ImageTargetService` through HTTP API routes mounted on the Express host, covering full CRUD and a Phase 1 compile stub. This is the first W5 deliverable and unblocks target-experience binding.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- W4 is complete. Express host is the runnable backend at `localhost:3001`.
- `ImageTargetService` is fully implemented at `server/services/image-target.service.ts` — no service changes needed.
- The `targets/` and `targets/[id]/compile/` directory stubs already existed under `server/examples/next-app-router/app/api/targets/` but contained no route files.
- `requireApiKey` middleware is available at `server/examples/next-app-router/lib/api-key-auth.ts`.
- `imageTargetService` singleton is already exported from `server/examples/next-app-router/lib/services.ts`.
- This is a **main task file**. Review and validation should reuse `Task ID = TASK-008` with different roles.

## Owned Files

- `server/examples/next-app-router/app/api/targets/route.ts` ← **created**
- `server/examples/next-app-router/app/api/targets/[id]/route.ts` ← **created**
- `server/examples/next-app-router/app/api/targets/[id]/compile/route.ts` ← **created**
- `server/examples/express-host/index.js` ← **updated**
- `docs/plan/phase1-checklist.md` ← **updated**

## Role-Based Output Convention

- `implementer` / `planner` → `docs/agents/results/TASK-008-<agent>.md`
- `reviewer` → `docs/agents/reviews/TASK-008-review-<agent>.md`
- `verifier` → `docs/agents/results/TASK-008-validation-<agent>.md`

## Do Not Change

- `server/services/**`
- `server/storage/**`
- `prisma/**`
- `src/**`
- `pipeline/**`

## Inputs

- `docs/agents/shared-context.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `server/services/image-target.service.ts`
- `server/examples/next-app-router/lib/services.ts`
- `server/examples/next-app-router/lib/api-key-auth.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts` — auth + response pattern reference
- `server/examples/express-host/index.js` — host mount pattern reference
- `prisma/schema.prisma` — `ImageTarget` model and `ImageTargetCompileStatus` enum

## Routes Delivered

| Method | Path | Handler file | Description |
|---|---|---|---|
| `POST` | `/api/targets` | `targets/route.ts` | Create a new image target |
| `GET` | `/api/targets?projectId=` | `targets/route.ts` | List all targets for a project |
| `GET` | `/api/targets/:id` | `targets/[id]/route.ts` | Get a single target |
| `PATCH` | `/api/targets/:id` | `targets/[id]/route.ts` | Update `name`, `sourceImageUrl`, `physicalWidthCm` |
| `DELETE` | `/api/targets/:id` | `targets/[id]/route.ts` | Delete a target |
| `POST` | `/api/targets/:id/compile` | `targets/[id]/compile/route.ts` | Phase 1 stub — sets `compileStatus → READY` |

## Auth Pattern

All routes validate `x-api-key` against the owning project via `requireApiKey`. For `[id]` routes, the target is fetched first to obtain `projectId`, then auth is checked — no `projectId` is required in the URL.

## Express Host Changes

- CORS `Access-Control-Allow-Methods` extended to include `PATCH` and `DELETE`.
- CORS `Access-Control-Allow-Headers` extended to include `x-api-key` (was missing — would have broken browser preflight for authed requests).
- Added `targetIdContext(req)` helper (mirrors existing `projectSlugContext`).
- All 6 routes mounted and verified.

## Required Output (for reviewer/verifier)

- `docs/agents/reviews/TASK-008-review-<agent>.md`
- Include:
  - Review of auth consistency across all 6 routes
  - Review of `resolveAndAuth` helper pattern in `[id]/route.ts`
  - Confirm CORS changes are safe and complete
  - Confirm compile stub behaviour is appropriate for Phase 1
  - Confirm no service-layer or schema changes were made

## Acceptance Criteria

1. `npm run typecheck:server` passes with zero errors. ✅ (verified 2026-05-27)
2. `POST /api/targets` creates a record and returns `201` with the created target.
3. `GET /api/targets?projectId=001` returns an array of targets for the project.
4. `GET /api/targets/:id` returns the target or `404`.
5. `PATCH /api/targets/:id` updates allowed fields and returns the updated target.
6. `DELETE /api/targets/:id` removes the record and returns `204`.
7. `POST /api/targets/:id/compile` sets `compileStatus` to `READY` and returns `200` with `stub: true`.
8. All write routes return `401`/`403` when called without a valid `x-api-key`.
9. No changes to `server/services/**`, `prisma/**`, or `src/**`.

## Validation

- Smoke test against `localhost:3001` using project `id=001`, `slug=smoke-test`, `apiKey=test-key-001`.
- Verifier should exercise the full CRUD cycle: create → get → patch → compile → delete.
- Check that a `PROCESSING` compile target returns `409` on a second compile attempt.
- Check that requests without `x-api-key` return `401`.

## Notes

- The `[id]/compile` route intentionally skips the `PROCESSING` intermediate state in Phase 1 — it goes directly to `READY` to unblock target-experience binding without requiring a background job queue.
- Real `.mind` compilation (MindAR compiler integration) is a Phase 2 task tracked in `docs/plan/strategy.md` §4.4.
- The `physicalWidthCm` field accepts `null` in `PATCH` to allow clearing the value.
