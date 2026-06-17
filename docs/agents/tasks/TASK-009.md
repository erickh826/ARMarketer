# TASK-009 — Target-Experience Binding API Routes

## Metadata

- Task ID: `TASK-009`
- Default role: `implementer`
- Suggested first agent: `copilot`
- Status: `todo`
- Priority: `high`

## Objective

Expose the ARExperience CRUD operations through HTTP API routes and implement target-experience binding endpoints. This completes the W5 data-linkage requirements and unblocks W6 viewer integration work.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- W5 ImageTarget API (TASK-008) is complete and verified. All target CRUD routes are mounted on the Express host.
- `ARExperienceService` is fully implemented at `server/services/ar-experience.service.ts` and validates same-project constraints.
- Prisma schema already defines the bidirectional relationships:
  - `ARExperience.imageTargetId` (many-to-one)
  - `ImageTarget.boundExperienceId` (one-to-one, unique)
- No schema or service changes are needed for this task.
- This is a **main task file**. Review and validation should reuse `Task ID = TASK-009` with different roles.

## Owned Files

- `server/examples/next-app-router/app/api/experiences/route.ts` ← **create**
- `server/examples/next-app-router/app/api/experiences/[id]/route.ts` ← **create**
- `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts` ← **create**
- `server/examples/express-host/index.js` ← **update**
- `docs/plan/phase1-checklist.md` ← **update**

## Role-Based Output Convention

- `implementer` / `planner` → `docs/agents/results/TASK-009-<agent>.md`
- `reviewer` → `docs/agents/reviews/TASK-009-review-<agent>.md`
- `verifier` → `docs/agents/results/TASK-009-validation-<agent>.md`

## Do Not Change

- `server/services/**`
- `server/storage/**`
- `prisma/**`
- `src/**`
- `pipeline/**`

## Inputs

- `docs/agents/shared-context.md`
- `docs/plan/TASK-009-plan.md` — detailed planning document
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `server/services/ar-experience.service.ts`
- `server/examples/next-app-router/lib/services.ts`
- `server/examples/next-app-router/lib/api-key-auth.ts`
- `server/examples/next-app-router/app/api/targets/route.ts` — auth + route pattern reference (TASK-008)
- `server/examples/express-host/index.js` — mount pattern reference (TASK-008)
- `prisma/schema.prisma` — ARExperience and ImageTarget models

## Routes Delivered

| Method | Path | Handler file | Description |
|---|---|---|---|
| `POST` | `/api/experiences` | `experiences/route.ts` | Create a new AR experience |
| `GET` | `/api/experiences?projectId=` | `experiences/route.ts` | List all experiences for a project |
| `GET` | `/api/experiences/:id` | `experiences/[id]/route.ts` | Get a single experience with relations |
| `PATCH` | `/api/experiences/:id` | `experiences/[id]/route.ts` | Update experience (including `imageTargetId`) |
| `DELETE` | `/api/experiences/:id` | `experiences/[id]/route.ts` | Delete an experience |
| `POST` | `/api/targets/:targetId/bind/:experienceId` | `targets/[id]/bind/route.ts` | Bind an experience to a target |
| `DELETE` | `/api/targets/:targetId/bind` | `targets/[id]/bind/route.ts` | Unbind the currently bound experience |

## Auth Pattern

All routes validate `x-api-key` against the owning project via `requireApiKey`. For `[id]` routes, the resource is fetched first to obtain `projectId`, then auth is checked.

## Key Validation Rules

- **Same-project constraint:** If creating/updating an experience with `imageTargetId`, both must belong to the same project (service layer validates this, return `422` if mismatch).
- **Binding constraint:** When binding an experience to a target, both must belong to the same project and the experience should already have that `imageTargetId`.
- **Unique bound:** A target can have only one `boundExperienceId` at a time. Setting a new bound experience replaces the old one.
- **Unbinding:** When a target is unbound, its `boundExperienceId` is set to null.

## Required Output (for reviewer/verifier)

- `docs/agents/reviews/TASK-009-review-<agent>.md`
- Include:
  - Review of auth consistency across all 7 routes
  - Review of same-project validation pattern
  - Confirm CORS changes (if any) are safe
  - Confirm binding semantics (one-to-one vs many-to-one) are correctly handled
  - Confirm includes/relations are correct (imageTarget, mediaAsset)
  - Confirm no service-layer or schema changes were made

## Acceptance Criteria

1. `npm run typecheck:server` passes with zero errors. 
2. `POST /api/experiences` creates an experience with optional `imageTargetId` and returns `201`.
3. `GET /api/experiences?projectId=001` returns array of experiences for the project.
4. `GET /api/experiences/:id` returns single experience with `imageTarget` and `mediaAsset` includes.
5. `PATCH /api/experiences/:id` updates allowed fields (name, imageTargetId, mediaAssetId, contentSceneId, transform, animationConfig, audioUrl) and returns `200`.
6. `DELETE /api/experiences/:id` deletes and returns `204`.
7. `POST /api/targets/:targetId/bind/:experienceId` sets `boundExperienceId` and returns `200` with updated target.
8. `DELETE /api/targets/:targetId/bind` unsets `boundExperienceId` and returns `204`.
9. All write routes return `401`/`403` when called without a valid `x-api-key`.
10. Same-project validation: `POST /api/experiences` with mismatched `imageTargetId` returns `422`.
11. Binding validation: `POST /api/targets/xyz/bind/abc` with mismatched projects returns `422`.
12. No changes to `server/services/**`, `prisma/**`, or `src/**`.

## Validation

- Smoke test against `localhost:3001` using project `id=001`, `slug=smoke-test`, `apiKey=test-key-001`.
- Verifier should exercise the full workflow: create experience → bind to target → update experience → unbind → delete experience.
- Check that binding replaces the previous bound experience (only one can be bound at a time).
- Check that deleting a bound experience leaves the target's `boundExperienceId` as null.
- Check that requests without `x-api-key` return `401`.

## Notes

- **Service layer is proven:** `ARExperienceService.create()` already validates same-project constraints. No service logic changes are needed.
- **Error handling:** return `422` for validation failures (same-project, duplicate binding), `404` for missing resources, `401`/`403` for auth.
- **Includes:** make sure `GET` routes include `imageTarget` and `mediaAsset` relations so the viewer can use the full payload later.
- **Binding semantics:** the bind/unbind endpoints operate on `ImageTarget.boundExperienceId`, which is a one-to-one relationship enforced by `@unique` in the schema.
