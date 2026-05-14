# ARMarketer — Current Status

> Last updated: 2026-05-14
> Scope: repo reality check against `system_plan.md` and `docs/plan/phase_plan/phase1.md`

## Current Stage

- **Phase:** Phase 1
- **Stage:** **W2 complete / W3 in progress**
- **Summary:** W1 feasibility POC exists, W2 viewer skeleton exists, W3 schema + pipeline + backend service skeleton exists, but Gate 2 and Gate 3 are **not yet passed**.

## Progress Matrix

| Plan Item | Planned Week | Current Status | Repo Evidence | Missing / Gap |
| :--- | :--- | :--- | :--- | :--- |
| MindAR image tracking feasibility POC | W1 | **Partial complete** | `public/poc.html` | Still A-Frame HTML POC; no formal multi-device test record; not yet integrated into React/R3F app |
| Device validation for Gate 1 | W1 | **Not recorded** | No dedicated test report found | Need actual test matrix, phones, browser versions, pass/fail notes |
| 100MB-class 3D viewer POC | W2 | **Partial complete** | `src/components/ModelViewer.tsx` | Viewer exists, but no measured stress-test report for Gate 2 |
| OBJ support | W2 | **Complete (POC level)** | `ModelViewer.tsx`, `public/concrete-rubble-scan/**` | Still needs large-file validation record |
| FBX support | W2 | **Complete (POC level)** | `ModelViewer.tsx` uses `useFBX` | Needs actual high-size sample validation |
| GLB support for W3 output | W3 | **Not complete** | `ModelViewer.tsx` type includes `glb` | No real GLB loader branch implemented |
| Prisma core schema | W2-W3 | **Complete (initial skeleton)** | `prisma/schema.prisma` | Needs migration, validation in runnable env, and app integration |
| Project service | W3-W6 | **Initial skeleton complete** | `server/services/project.service.ts` | Needs route wiring / real app integration |
| MediaAsset service | W3-W4 | **Initial skeleton complete** | `server/services/media-asset.service.ts` | Upload lifecycle still incomplete |
| ImageTarget service | W3-W5 | **Initial skeleton complete** | `server/services/image-target.service.ts` | Missing dedicated bind workflow / compile orchestration |
| ARExperience service | W3-W6 | **Initial skeleton complete** | `server/services/ar-experience.service.ts` | Missing contentType vs asset kind validation |
| Upload authorization route | W4 | **Example available** | `server/examples/next-app-router/app/api/assets/upload/route.ts` | Still example code; not mounted into a real running app here |
| Local upload route | W4 | **Example available** | `server/examples/next-app-router/app/uploads/[...path]/route.ts` | Same issue: example only, not integrated into current Vite app |
| Blender conversion pipeline POC | W3 | **Partial complete** | `pipeline/run_convert.sh`, `pipeline/scripts/convert.py`, `pipeline/Dockerfile` | Need verified sample output, artifact record, and CMS linkage |
| MediaAsset lineage design | W3 | **Designed + partially implemented** | `prisma/schema.prisma`, `media-asset.service.ts`, `docs/plan/pipeline-asset-flow.md` | Still missing end-to-end raw -> processed -> viewer flow |
| Viewer reads CMS data | W6 | **Not started** | `ProjectService.getViewerConfigBySlug()` exists | No actual front-end integration yet |
| Hotspot / 360 / editor work | W4-W7 | **Not started** | No implementation found | Planned future work |
| Share link / QR / auth / publish flow | W7-W8 | **Not started** | No production implementation found | Planned future work |

## Workstream Status

### 1. Frontend / Viewer

- `ModelViewer.tsx` already has:
  - loading progress UI
  - OBJ loader
  - FBX loader
  - manual cleanup / dispose flow
- Current blocker:
  - GLB, which is the intended W3 pipeline output, is not actually loadable yet.

### 2. AR / MindAR

- `public/poc.html` proves basic image tracking feasibility.
- Current blocker:
  - no React / R3F integration path yet
  - no formal Gate 1 device test log

### 3. Backend / CMS Skeleton

- Core Prisma models already exist:
  - `Project`
  - `MediaAsset`
  - `ImageTarget`
  - `ARExperience`
- Service layer already exists; this is **not greenfield anymore**.
- Current blocker:
  - routes are still example-level
  - upload lifecycle is incomplete
  - no mounted app path for smoke testing in current repo shape

### 4. Pipeline

- Docker + Blender conversion scripts exist.
- Direction aligns with docs: raw FBX/OBJ -> optimized GLB.
- Current blocker:
  - no verified output artifact stored in repo/session docs
  - no confirmed end-to-end linkage from upload -> pipeline -> derived asset -> viewer

## Gate Result Record

## Gate 1 — MindAR feasibility on target phones

- **Status:** `AT_RISK / NOT FORMALLY PASSED`
- **What exists:**
  - `public/poc.html` MindAR A-Frame POC
- **What is missing:**
  - named device/browser matrix
  - recognition stability results
  - lighting / print-size / marker quality notes
- **Decision:** treat as **POC completed**, but **gate evidence incomplete**

## Gate 2 — 100MB-class asset can be loaded and operated

- **Status:** `IN PROGRESS / NOT PASSED`
- **What exists:**
  - viewer skeleton
  - progress UI
  - dispose logic
  - OBJ/FBX support
- **What is missing:**
  - 100MB+ benchmark asset evidence
  - memory observations
  - first meaningful interaction timing
  - crash / stall record
  - written report
- **Decision:** do **not** mark Gate 2 passed yet

## Gate 3 — pipeline can produce acceptable optimized GLB

- **Status:** `PARTIAL SKELETON / NOT PASSED`
- **What exists:**
  - conversion scripts
  - docs assume optimized GLB target
  - `MediaAsset` lineage model exists
- **What is missing:**
  - actual confirmed sample conversion result
  - before/after size comparison
  - quality review record
  - viewer successfully loading pipeline output
- **Decision:** Gate 3 has groundwork only

## Gate 4 — 3 legacy cards rebuilt and accepted

- **Status:** `NOT STARTED`

## Known Validation Limits

- `npm` / `node` were not available in the current shell environment during this review session, so runtime/typecheck validation could not be re-run here.
- Therefore this status file is based on:
  - file inspection
  - existing session notes
  - architecture consistency checks

## Immediate Truths To Keep In Mind

1. **GLB is already the intended main output format.** Viewer support is still behind the plan.
2. **Backend service work should now be described as hardening/integration, not starting from scratch.**
3. **MindAR integration is now an architecture task, not just a POC cleanup.**
4. **Formal gate results are still mostly missing even where code skeletons exist.**
