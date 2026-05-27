# TASK-006 Result — codex (implementer)

## 1. Summary

- **Verdict: implemented**
- Added a minimal derived-asset registration route under the example Next app boundary.
- The route persists a `READY` optimized GLB as a derived `MediaAsset` through `mediaAssetService.createDerivedAsset()`.
- The response returns the created asset with `sourceAsset` included, so the source -> derived lineage chain is inspectable directly from the route result.

## 2. Files Touched or Reviewed

### Touched
- `server/examples/next-app-router/app/api/assets/derived/route.ts`
- `server/examples/next-app-router/lib/services.ts`
- `docs/agents/results/TASK-006-codex.md`

### Reviewed
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

## 3. Implementation Notes

- Added `RegisterDerivedAssetRequest` beside `UploadAssetRequest` in the example service boundary.
- Added `POST /api/assets/derived` with validation aligned to the existing upload route style.
- The route uses `mediaAssetService.createDerivedAsset()` only; it does not call Prisma directly.
- Derived assets are written with:
  - `kind = MODEL_3D`
  - `processedFormat = glb`
  - `status = READY`
  - `sourceAssetId` linked to the source asset
- Storage provider behavior:
  - `R2` is treated as the canonical target
  - `LOCAL` is used as the explicit fallback when the current storage service is local

## 4. Lineage Proof Shape

Successful responses now return:

- `asset.id` — derived asset id
- `asset.sourceAssetId` — pointer back to the source asset
- `asset.sourceAsset` — included source asset record

That means the route response itself exposes an inspectable chain:

- source asset record
- derived asset record
- explicit `sourceAssetId` linkage

## 5. Acceptance Criteria Check

1. `POST /api/assets/derived` creates a `READY` derived asset shape with `processedFormat = glb` and `sourceAssetId` populated.
2. Response includes linked source asset via `mediaAssetService.findById()` relations.
3. Route uses `mediaAssetService.createDerivedAsset()` and does not use raw Prisma writes.
4. Input validation follows the existing upload-route pattern.
5. TypeScript validation could not be completed in this shell because `node`/`npx` are unavailable in PATH.
6. Scope stayed inside the owned file list.

## 6. Known Limits

- I have not executed a live request against the new route in this session.
- I attempted server typecheck, but this shell environment does not have `node`/`npx` available in PATH, so acceptance item 5 remains environment-blocked rather than code-verified.

## 7. Risks

- `tsc` validation is still pending in a Node-capable shell, so the route is implemented and structurally reviewed, but not yet compiler-verified from this environment.
