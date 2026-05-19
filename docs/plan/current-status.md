# ARMarketer — Current Status

> Last updated: 2026-05-18
> Scope: repo reality check against `system_plan.md` and `docs/plan/phase_plan/phase1.md`

## Current Stage

- **Phase:** Phase 1
- **Stage:** **W2 complete / W3 in progress**
- **Summary:** W1 feasibility POC exists, Gate 2 now has real mobile evidence as `pass-with-warnings`, Gate 3 is formally accepted, and the main execution gap is now backend upload/route integration plus the first managed source -> derived asset proof.

## Progress Matrix

| Plan Item | Planned Week | Current Status | Repo Evidence | Missing / Gap |
| :--- | :--- | :--- | :--- | :--- |
| MindAR image tracking feasibility POC | W1 | **Partial complete** | `public/poc.html` | Still A-Frame HTML POC; no formal multi-device test record; not yet integrated into React/R3F app |
| Device validation for Gate 1 | W1 | **Not recorded** | No dedicated test report found | Need actual test matrix, phones, browser versions, pass/fail notes |
| 100MB-class 3D viewer POC | W2 | **Complete with warnings** | `src/components/ModelViewer.tsx`; `docs/session/2026-05-14-gate2-report.md`; `docs/session/2026-05-14-gate2-mobile-report.md` | Mobile loadability is now evidenced, but field-observed load times are ~27-30s and instrumentation is limited |
| OBJ support | W2 | **Complete (POC level)** | `ModelViewer.tsx`, `public/concrete-rubble-scan/**` | Still needs large-file validation record |
| FBX support | W2 | **Complete (POC level)** | `ModelViewer.tsx` uses `useFBX` | Needs actual high-size sample validation |
| GLB support for W3 output | W3 | **Complete (current Phase 1 baseline)** | `ModelViewer.tsx`; `public/test-assets/factory-lod0-opt.glb`; `docs/session/2026-05-15-gate3-report.md` | Future work is managed-flow integration, not baseline viewer proof |
| Prisma core schema | W2-W3 | **Complete** | `prisma/schema.prisma` | Skeleton and initial relations drafted |
| Project service | W3-W6 | **Complete (service layer)** | `server/services/project.service.ts` | Service logic exists; needs integration to routes |
| MediaAsset service | W3-W4 | **Complete (service layer)** | `server/services/media-asset.service.ts` | Lineage and resolution logic implemented |
| ImageTarget service | W3-W5 | **Complete (service layer)** | `server/services/image-target.service.ts` | Service logic exists |
| ARExperience service | W3-W6 | **Complete (service layer)** | `server/services/ar-experience.service.ts` | Service logic exists |
| Upload authorization route | W4 | **Example available** | `server/examples/next-app-router/app/api/assets/upload/route.ts` | Still example code; not mounted into a real running app here |
| Local upload route | W4 | **Example available** | `server/examples/next-app-router/app/uploads/[...path]/route.ts` | Same issue: example only, not integrated into current Vite app |
| Blender conversion pipeline POC | W3 | **Complete (secondary path)** | `pipeline/run_convert.sh`, `pipeline/scripts/convert.py`, `pipeline/Dockerfile` | Secondary/future path; not the current official pipeline on this machine |
| Docker-free conversion pipeline | W3 | **Complete (accepted baseline)** | `pipeline/scripts/convert_trimesh.py`; `docs/session/2026-05-15-gate3-report.md` | Needs later production hardening only as follow-up |
| MediaAsset lineage design | W3 | **Designed + partially implemented** | `prisma/schema.prisma`, `media-asset.service.ts`, `docs/plan/pipeline-asset-flow.md` | Still missing one formal source -> derived proof record |
| Viewer reads CMS data | W6 | **Not started** | `ProjectService.getViewerConfigBySlug()` exists | No actual front-end integration yet |
| Hotspot / 360 / editor work | W4-W7 | **Not started** | No implementation found | Planned future work |
| Share link / QR / auth / publish flow | W7-W8 | **Not started** | No production implementation found | Planned future work |

## Workstream Status

### 1. Frontend / Viewer

- `ModelViewer.tsx` already has:
  - loading progress UI
  - OBJ loader
  - FBX loader
  - GLB loader
  - manual cleanup / dispose flow
- `App.tsx` supports query-param asset targeting for validation flows, so large-asset tests do not need a code-path swap for each asset.
- Current blocker:
  - managed upload/publish integration is still missing even though the baseline GLB path is now validated.

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
  - no confirmed end-to-end linkage from upload -> pipeline -> derived asset -> viewer
  - R2 storage contract is not yet operationalized in the running app flow

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

- **Status:** `PASS-WITH-WARNINGS`
- **What exists:**
  - viewer skeleton
  - progress UI
  - dispose logic
  - OBJ/FBX/GLB support
  - desktop stress-test report using a 100MB-class asset
  - mobile real-device evidence on iPhone 14 Safari and Pixel 6 Chrome
- **What is missing:**
  - remote-debug console and memory trace
  - tighter timing separation between network and runtime cost
- **Decision:** Gate 2 loadability is proven on desktop and mobile, but the mobile result carries performance/instrumentation warnings

## Gate 3 — pipeline can produce acceptable optimized GLB

- **Status:** `PASSED`
- **What exists:**
  - formalized current pipeline path
  - optimized output artifact
  - before/after size evidence
  - viewer runtime smoke test evidence
  - visual quality note
  - hardened `convert_trimesh.py`
- **What is still follow-up rather than a gate blocker:**
  - formal `MediaAsset` lineage proof record
  - R2-backed managed upload/pipeline integration
- **Decision:** Gate 3 is formally accepted for the current Phase 1 baseline

## Gate 4 — 3 legacy cards rebuilt and accepted

- **Status:** `NOT STARTED`

## Known Validation Limits

- `npm` / `node` were not available in the current shell environment during this review session, so runtime/typecheck validation could not be re-run here.
- Therefore this status file is based on:
  - file inspection
  - existing session notes
  - architecture consistency checks

## Immediate Truths To Keep In Mind

1. **GLB is now the accepted main output format for Phase 1.** Gate 3 baseline evidence is recorded and the Docker-free pipeline is the current official path on this machine.
2. **Backend service work should now be described as hardening/integration, not starting from scratch.**
3. **MindAR integration is now an architecture task, not just a POC cleanup.**
4. **The main remaining proof gaps are managed source -> derived asset flow integration plus better-instrumented mobile performance evidence if stricter Gate 2 closeout is needed.**

## Follow-Up Order

1. `TASK-006` — implement the first managed source -> derived `MediaAsset` lineage proof and R2-aligned contract shape.
2. Follow-up 1 — re-run Gate 2 mobile validation with instrumentation:
   - capture remote-debug console output
   - capture memory observations if available
   - separate network wait from decode/render time
3. Continue broader route/upload integration after the lineage proof path is working.
