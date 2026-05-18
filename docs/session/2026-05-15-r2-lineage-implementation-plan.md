# R2 + Lineage Implementation Plan — 2026-05-15

## Objective

Define the smallest implementation step after Gate 3 that turns the accepted GLB pipeline into a managed asset contract the backend can actually understand.

## Why This Comes Next

Gate 3 already proved that optimized GLB output is viable. The next bottleneck is not rendering quality anymore. It is proving that the system can describe:

1. where large source and processed assets live
2. how a derived optimized asset points back to its source
3. how the viewer/backend resolves the correct ready asset

Without this contract, route integration will keep inventing ad-hoc assumptions.

## First Implementation Target

Implement one minimal source -> derived asset proof path inside the existing example backend boundary.

### In scope

- keep using existing Prisma schema and `MediaAssetService`
- keep the route boundary inside `server/examples/next-app-router/`
- define one derived-asset registration flow for optimized GLB

### Out of scope

- full production R2 credentials wiring
- full upload UI
- batch pipeline orchestration
- MindAR integration
- Gate 2 mobile work

## Minimal Contract To Implement

### 1. Raw/source asset contract

The existing upload-initiation route should remain the entry point for source assets:

- create upload authorization
- create source `MediaAsset`
- record:
  - `projectId`
  - `kind`
  - `originalFilename`
  - `storageProvider`
  - `storageKey`
  - `originalUrl`
  - `sourceFormat`
  - `status = UPLOADED`

### 2. Derived asset contract

Add one minimal backend path to register an optimized GLB result:

- input:
  - `projectId`
  - `sourceAssetId`
  - `name`
  - `storageKey`
  - `processedUrl`
  - `processedFormat = glb`
  - `fileSizeBytes`
  - optional metadata
- output:
  - created derived `MediaAsset`
  - resolved source/derived lineage view

The derived asset should be created as:

- `kind = MODEL_3D`
- `storageProvider = R2` for the intended production contract
- `status = READY`
- `sourceAssetId` linked to the original asset

### 3. Resolution proof

The implementation should show that existing ready-resolution logic can identify the optimized asset as the publishable/viewer-ready asset.

## Recommended TASK-006 Scope

### Primary files

- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`
- optional helper in the example service layer

### Deliverables

- route or service-backed lineage proof
- concise task result artifact
- one short session note recording the proof and any mismatch

## Acceptance Criteria For TASK-006

1. Source asset placeholder creation remains valid.
2. Derived asset registration succeeds for one optimized GLB case.
3. `sourceAssetId` lineage is stored and retrievable.
4. The resulting data shape is compatible with `MediaAssetService` ready-resolution logic.
5. The implementation remains limited to the example backend boundary and does not sprawl into unrelated runtime integration.

## Recommended Sequence

1. Implement derived-asset registration path.
2. Demonstrate one lineage proof record.
3. Record the proof in a short session artifact.
4. Then start the broader routes/upload integration task.
