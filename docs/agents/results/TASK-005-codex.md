# TASK-005 Result — codex (planner)

## 1. Summary

- **Verdict: ready to implement**
- The next critical-path step should be a narrow backend integration task focused on one managed asset contract:
  - create or confirm the raw upload placeholder
  - register one derived optimized asset
  - prove `sourceAssetId` lineage
  - resolve the ready asset through existing service logic
- This should happen before broader route integration because it fixes the data contract that later routes must honor.

## 2. Files Touched or Reviewed

### Touched
- `docs/agents/tasks/TASK-005.md`
- `docs/agents/results/TASK-005-codex.md`
- `docs/session/2026-05-15-r2-lineage-implementation-plan.md`
- `docs/agents/shared-context.md`

### Reviewed
- `docs/agents/MANUAL.md`
- `docs/agents/shared-context.md`
- `docs/agents/decisions.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/plan/pipeline-asset-flow.md`
- `docs/session/2026-05-15-gate3-formalization-plan.md`
- `docs/session/2026-05-15-gate3-report.md`
- `server/services/media-asset.service.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- `prisma/schema.prisma`

## 3. Findings

- The repo already has the core lineage primitives in `MediaAssetService`; the real gap is not schema design, but operationalizing one trustworthy source -> derived asset flow.
- The example upload authorization route is already close to useful for the raw-upload half of the contract.
- The missing half is a formalized "pipeline result registration" path that turns:
  - raw uploaded asset
  - processed artifact URL/key
  - final `READY` derived asset
  into a reproducible linkage proof.
- A doc-only proof would be too weak now that Gate 3 has already passed. The next proof should be **service-backed** and preferably **route-backed if it can stay small**.

## 4. Recommended Next Main Task

- **Next Task ID:** `TASK-006`
- **Type:** `implementer`
- **Scope:** implement the smallest managed lineage proof path using existing services

Recommended objective:

> Add a minimal backend path that can register a derived optimized asset for an existing source asset, persist `sourceAssetId` lineage, and return the ready asset record that the viewer should use.

## 5. Recommended Write Scope For TASK-006

- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- new route under `server/examples/next-app-router/app/api/assets/derived/route.ts` or equivalent minimal path
- optional shared helper under the example app service boundary
- `docs/agents/results/TASK-006-<agent>.md`
- one short session note recording the proof result

## 6. Acceptance Shape For TASK-006

TASK-006 should be considered done when it can demonstrate all of the following:

1. A source `MediaAsset` can exist in `UPLOADED` or `PROCESSING` form with stable storage metadata.
2. A derived `MediaAsset` can be created with:
   - `storageProvider = R2` or the current provider chosen by the storage service
   - `processedUrl`
   - `processedFormat = glb`
   - `status = READY`
   - `sourceAssetId` pointing to the original asset
3. The returned records make the lineage chain inspectable.
4. `findReadyOptimizedAssetForExperience()` or equivalent ready-resolution logic can consume the result shape without additional schema work.

## 7. Risk Notes

- The route examples currently prove upload initiation and local byte serving, but not pipeline result registration.
- If R2 signing/presign details are not yet wired, TASK-006 should still implement the contract shape and use a deterministic placeholder/public URL strategy inside the example boundary rather than blocking on infrastructure.
- Avoid dragging TASK-006 into full CMS host integration; keep it on the example app boundary.
