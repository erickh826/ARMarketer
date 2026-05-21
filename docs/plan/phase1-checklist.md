# Phase 1 Checklist

> Last updated: 2026-05-20
> Status legend: `[x] done` / `[-] partial` / `[ ] not started`

## W1 — Feasibility

- [-] MindAR POC created
  - Evidence: `public/poc.html`
- [-] Multi-device test matrix recorded
  - Evidence: `docs/session/2026-05-21-gate1-test-protocol.md` (protocol defined, device run pending)
- [ ] Gate 1 result logged with pass/fail decision
- [x] Fallback trigger defined if MindAR stability is insufficient
  - Evidence: `docs/session/2026-05-21-gate1-test-protocol.md` Section 5

## W2 — Viewer + Core Schema

- [x] Viewer POC created
  - Evidence: `src/components/ModelViewer.tsx`
- [x] OBJ loading works in current sample app
  - Evidence: `src/App.tsx`, `public/concrete-rubble-scan/**`
- [x] FBX loading path exists
  - Evidence: `useFBX` in `ModelViewer.tsx`
- [x] GLB loading implemented
  - Evidence: `useGLTF` branch in `ModelViewer.tsx`, `public/test-assets/test-cube.glb`, `src/App.tsx`
- [-] Gate 2 test plan / review / validation completed
  - Evidence: `docs/agents/results/TASK-002-gemini.md`, `docs/agents/reviews/TASK-002-review-cursor.md`, `docs/agents/results/TASK-002-validation-codex.md`
- [x] 100MB+ stress test executed
  - Evidence: `docs/session/2026-05-14-gate2-report.md`, `docs/session/2026-05-14-gate2-mobile-report.md`
- [x] Gate 2 report written
  - Evidence: `docs/session/2026-05-14-gate2-report.md`, `docs/session/2026-05-14-gate2-mobile-report.md`
- [x] Prisma core schema drafted
  - Evidence: `prisma/schema.prisma`
- [x] Server typecheck bootstrap fixed
  - Evidence: `package.json` now runs `prisma generate` before `typecheck:server`
- [x] Auth strategy implemented
  - Evidence: `prisma/schema.prisma` Project.apiKey (nullable unique), `server/examples/next-app-router/lib/api-key-auth.ts`, upload and derived routes protected; projects without an apiKey remain open (backward compatible)

## W3 — Pipeline + Data Linkage

- [x] Blender conversion pipeline skeleton exists
  - Evidence: `pipeline/run_convert.sh`, `pipeline/scripts/convert.py`
- [x] Successful OBJ/FBX -> GLB example artifact recorded
  - Evidence: `pipeline/output/20251228_004_RC_LOD0_opt.glb`, `public/test-assets/factory-lod0-opt.glb`, `docs/session/2026-05-15-gate3-report.md`
- [x] Before/after size comparison recorded
  - Evidence: `docs/session/2026-05-15-gate3-preliminary-report.md`, `docs/session/2026-05-15-gate3-report.md`
- [x] Quality review notes recorded
  - Evidence: `docs/session/2026-05-15-gate3-evidence-note.md`
- [x] `MediaAsset` lineage model exists
  - Evidence: `prisma/schema.prisma`, `MediaAssetService`
- [x] Derived asset flow tested end-to-end
  - Evidence: `server/examples/next-app-router/app/api/assets/derived/route.ts`, smoke test 2026-05-20 confirmed source→derived lineage via express host
- [x] Gate 3 result logged
  - Evidence: `docs/session/2026-05-15-gate3-report.md`

## W4 — Upload + Viewer Flow

- [x] Upload authorization example route exists
  - Evidence: `server/examples/next-app-router/app/api/assets/upload/route.ts`
- [x] Local upload example route exists
  - Evidence: `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- [x] Example routes integrated into a real app host
  - Evidence: `server/examples/express-host/index.js`, TASK-007 verified 2026-05-19
- [x] Upload smoke test passed on actual host
  - Evidence: 2026-05-20 session — POST upload (201) → PUT binary (204) → POST derived (201) with lineage → GET experience (200); all routes verified against `localhost:3001` with project `001/smoke-test`
- [x] Viewer can load asset published through the managed flow
  - Evidence: 2026-05-20 — viewer loaded `factory-lod0-opt.glb` via `?url=http://localhost:3001/uploads/optimized/001/...` — CORS-enabled express host confirmed

## W5 — Target / Editor Management

- [ ] ImageTarget management API/UI
- [ ] Dedicated target-experience binding workflow
- [ ] Hotspot editor UI initial version

## W6 — AR Experience Read Path

- [ ] Viewer reads real CMS/DB-backed experience data
- [ ] MindAR + React/R3F integration spike completed
- [ ] ARExperience CRUD wired into real app flow

## W7 — Sharing

- [ ] Share link flow
- [ ] QR generation flow
- [ ] AR card generator UI

## W8 — Stability

- [ ] Mobile error handling
- [ ] Loading state UX polish
- [ ] Permission control
- [ ] Data state management hardening

## W9 — Acceptance

- [ ] 3 legacy Zapworks cards rebuilt
- [ ] Pressure / cache / CDN validation
- [ ] Gate 4 result logged

## W10 — Launch

- [ ] Deployment hardening
- [ ] Monitoring
- [ ] Backup
- [ ] MVP release checklist signed off

## Gate Result Log

| Gate | Goal | Current Status | Notes |
| :--- | :--- | :--- | :--- |
| Gate 1 | MindAR stable on target phones | `evidence-missing` | POC exists, formal device validation missing |
| Gate 2 | 100MB-class asset loadability proven | `pass-with-warnings` | Desktop and mobile evidence now exist for `cyberpunk_city.glb`; iPhone 14 Safari and Pixel 6 Chrome completed load without crash/context loss, but observed load times were ~27-30s and no remote-debug trace was captured |
| Gate 3 | Optimized GLB pipeline output accepted | `PASSED` | Visual smoke test successful (2.62MB); Docker-free pipeline formalized; evidence recorded in docs/session/2026-05-15-gate3-evidence-note.md |
| Gate 4 | 3 legacy cards rebuilt and accepted | `not-started` | Future milestone |
