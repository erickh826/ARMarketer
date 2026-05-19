# Shared Context

> Last updated: 2026-05-15
> This file is the shared source of truth for external CLI agents working on this repo.

## Repo

- Name: `ARMarketer`
- Goal: build a Web AR/VR/3D marketing platform to replace Zapworks-dependent delivery

## Current Stage

- Phase: `Phase 1`
- Status: `W3 in progress / Gate 3 passed`

## Current Truths

1. MindAR feasibility POC exists in `public/poc.html`, but formal Gate 1 evidence is still missing.
2. Viewer skeleton exists in `src/components/ModelViewer.tsx` and supports OBJ, FBX, and GLB. `src/App.tsx` also supports query-param asset targeting for validation runs.
3. Optimized GLB is the primary pipeline output. Current test assets include `test-cube.glb` (tiny smoke asset), `low_poly_wood_crate.glb` (1.7MB), and `factory-lod0-opt.glb` (2.6MB optimized from 171MB).
4. **Gate 2 Pass-With-Warnings:** Stress test evidence now exists on desktop plus real-device mobile runs (iPhone 14 Safari, Pixel 6 Chrome) for `cyberpunk_city.glb`; no crash/context loss was observed, but mobile load times were roughly 27-30 seconds and instrumentation was limited.
5. **Gate 3 Passed:** `factory-lod0-opt.glb` has formal runtime and visual evidence, and the Docker-free `trimesh` + `gltf-transform` path is the current accepted Phase 1 pipeline.
6. **R2 Decision:** Large source assets and pipeline outputs will be hosted on Cloudflare R2, not in Git.
7. Prisma schema and backend services are functional (Project, MediaAsset, ImageTarget, ARExperience).

## Primary Planning Files

- `system_plan.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-15-gate3-formalization-plan.md`

## Current Recommended Priority

1. Implement the first real R2-aligned source -> derived `MediaAsset` lineage proof.
2. Integrate existing backend services and example routes into a managed upload/pipeline flow.
3. Re-attempt Gate 2 mobile validation once a remote debugging environment is available.
4. Start the MindAR + React/R3F architecture task after the asset flow contract is stable.

## Collaboration Rules

- One owner per write scope.
- Do not silently expand scope.
- If repo truth conflicts with assumptions, record the mismatch in the task result.
- Always list files touched or reviewed.
- Reviewer agent label is `gemini`.
