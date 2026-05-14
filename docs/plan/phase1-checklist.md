# Phase 1 Checklist

> Last updated: 2026-05-14
> Status legend: `[x] done` / `[-] partial` / `[ ] not started`

## W1 — Feasibility

- [-] MindAR POC created
  - Evidence: `public/poc.html`
- [ ] Multi-device test matrix recorded
- [ ] Gate 1 result logged with pass/fail decision
- [ ] Fallback trigger defined if MindAR stability is insufficient

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
- [-] 100MB+ stress test executed
  - Evidence: `docs/session/2026-05-14-gate2-report.md` (desktop pass with 138 MB GLB; mobile pending)
- [x] Gate 2 report written
  - Evidence: `docs/session/2026-05-14-gate2-report.md`
- [x] Prisma core schema drafted
  - Evidence: `prisma/schema.prisma`
- [ ] Auth strategy implemented

## W3 — Pipeline + Data Linkage

- [x] Blender conversion pipeline skeleton exists
  - Evidence: `pipeline/run_convert.sh`, `pipeline/scripts/convert.py`
- [ ] Successful FBX -> GLB example artifact recorded
- [ ] Before/after size comparison recorded
- [ ] Quality review notes recorded
- [x] `MediaAsset` lineage model exists
  - Evidence: `prisma/schema.prisma`, `MediaAssetService`
- [ ] Derived asset flow tested end-to-end
- [ ] Gate 3 result logged

## W4 — Upload + Viewer Flow

- [-] Upload authorization example route exists
  - Evidence: `server/examples/next-app-router/app/api/assets/upload/route.ts`
- [-] Local upload example route exists
  - Evidence: `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- [ ] Example routes integrated into a real app host
- [ ] Upload smoke test passed on actual host
- [ ] Viewer can load asset published through the managed flow

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
| Gate 2 | 100MB-class asset loadability proven | `desktop-passed-mobile-pending` | A 138 MB GLB loaded in under 10s and interacted smoothly on desktop with no console errors or context loss; mobile validation is still pending |
| Gate 3 | Optimized GLB pipeline output accepted | `not-passed` | Scripts exist, no recorded validated output |
| Gate 4 | 3 legacy cards rebuilt and accepted | `not-started` | Future milestone |
