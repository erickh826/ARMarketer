# TASK-006 — Implement derived asset registration route and MediaAsset lineage proof

## Metadata

- Task ID: `TASK-006`
- Default role: `implementer`
- Suggested first agent: `codex`
- Status: `todo`
- Priority: `high`

## Objective

Add a minimal backend route that registers an optimized GLB as a derived `MediaAsset` linked to an existing source asset, and demonstrate that the `sourceAssetId` lineage chain is inspectable end-to-end using the existing service layer.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- Gate 3 is formally passed. The pipeline produces 2.62 MB optimized GLBs from 171 MB OBJ sources.
- `MediaAssetService` already has all the primitives needed:
  - `createUploadPlaceholder()` — creates source asset record
  - `createDerivedAsset()` — creates derived asset with `sourceAssetId` link (enforces same-project)
  - `linkDerivedAsset()` — can re-link if needed
  - `findReadyOptimizedAssetForExperience()` — resolves the correct publishable asset
- The upload authorization route (`server/examples/next-app-router/app/api/assets/upload/route.ts`) handles source asset creation and is the correct reference pattern.
- `StorageService` supports `LOCAL`, `S3`, `R2`, `CDN` providers via `createStorageServiceFromEnv()`.
- There is currently NO route for registering a derived/processed asset. That is the gap.
- All work stays inside the `server/examples/next-app-router/` boundary.
- This is a **main task**. Review and validation should reuse `TaskId = TASK-006` with different roles.

## Owned Files

- `server/examples/next-app-router/app/api/assets/derived/route.ts` — **new file**
- `server/examples/next-app-router/lib/services.ts` — add `RegisterDerivedAssetRequest` type
- `docs/agents/results/TASK-006-<agent>.md`

## Role-Based Output Convention

- `implementer` -> `docs/agents/results/TASK-006-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-006-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-006-validation-<agent>.md`

## Do Not Change

- `src/**`
- `pipeline/**`
- `prisma/**`
- `server/services/**`
- `server/storage/**`
- `server/lib/**`
- `docs/agents/tasks/TASK-001*.md` through `TASK-005*.md`

## Inputs

- `docs/agents/shared-context.md`
- `docs/agents/decisions.md`
- `docs/agents/results/TASK-005-codex.md`
- `docs/session/2026-05-15-r2-lineage-implementation-plan.md`
- `docs/plan/pipeline-asset-flow.md`
- `server/services/media-asset.service.ts`
- `server/storage/storage.service.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/lib/services.ts`
- `prisma/schema.prisma`

## Required Output

### `server/examples/next-app-router/app/api/assets/derived/route.ts`

`POST` handler accepting:
- `projectId` (required)
- `sourceAssetId` (required)
- `name` (required)
- `storageKey` (required) — R2 or local key of the optimized GLB
- `processedUrl` (required) — public URL of the optimized GLB
- `fileSizeBytes` (optional)
- `metadata` (optional)

Creates derived `MediaAsset` with:
- `kind = MODEL_3D`
- `storageProvider = R2` (canonical target; fall back to `LOCAL` if env not set, document it)
- `processedFormat = glb`
- `status = READY`
- `sourceAssetId` pointing to the source record

Returns derived asset record with `sourceAsset` included.

Error cases:
- missing required fields → 400
- source asset not found → 404
- project mismatch → 422

### `server/examples/next-app-router/lib/services.ts`

Add `RegisterDerivedAssetRequest` type alongside existing `UploadAssetRequest`.

### `docs/agents/results/TASK-006-<agent>.md`

Include lineage proof: show that source asset → derived asset chain is resolvable from the response.

## Acceptance Criteria

1. `POST /api/assets/derived` returns a `READY` derived `MediaAsset` with `storageProvider`, `processedFormat = glb`, and `sourceAssetId` populated.
2. Response includes linked source asset (`include: { sourceAsset: true }`).
3. Uses `mediaAssetService.createDerivedAsset()` — no direct `prisma.mediaAsset.create()` in the route.
4. Input validation follows the same pattern as the existing upload route.
5. `npx tsc -p tsconfig.server.json --noEmit` exits 0.
6. No files changed outside the owned files list.

## Validation

- Reviewer: check field validation completeness, correct service method usage, no raw Prisma calls in route, correct HTTP status codes.
- Verifier: TypeScript clean, acceptance criteria met, no scope creep outside example boundary.

## Notes

- This is NOT a pipeline executor. The route receives already-processed artifact metadata and persists it.
- Do not add auth middleware — stay consistent with the existing upload route pattern.
- `RegisterDerivedAssetRequest` lives in `lib/services.ts` alongside `UploadAssetRequest`.
- R2 credentials are a deploy-time concern; `LOCAL` is acceptable as a dev fallback.
