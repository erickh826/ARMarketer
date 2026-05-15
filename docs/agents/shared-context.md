# Shared Context

> Last updated: 2026-05-15
> This file is the shared source of truth for external CLI agents working on this repo.

## Repo

- Name: `ARMarketer`
- Goal: build a Web AR/VR/3D marketing platform to replace Zapworks-dependent delivery

## Current Stage

- Phase: `Phase 1`
- Status: `W3 in progress / Gate 3 Formalization`

## Current Truths

1. MindAR feasibility POC exists in `public/poc.html`, but formal Gate 1 evidence is still missing.
2. Viewer skeleton exists in `src/components/ModelViewer.tsx` and supports OBJ, FBX, and GLB.
3. Optimized GLB is the primary pipeline output. Current test assets include `test-cube.glb` (tiny smoke asset), `low_poly_wood_crate.glb` (1.7MB), and `factory-lod0-opt.glb` (2.6MB optimized from 171MB).
4. **Gate 2 Desktop Evidence Recorded:** Stress test with 100MB-class assets (e.g., `cyberpunk_city.glb`) completed on desktop; mobile validation is currently blocked.
5. **R2 Decision:** Large source assets and pipeline outputs will be hosted on Cloudflare R2, not in Git.
6. Prisma schema and backend services are functional (Project, MediaAsset, ImageTarget, ARExperience).

## Primary Planning Files

- `system_plan.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-15-gate3-formalization-plan.md`

## Current Recommended Priority

1. Execute Gate 3 formal verification (Visual smoke test + Lineage proof).
2. Harden `convert_trimesh.py` and finalize the R2 storage contract.
3. Re-attempt Gate 2 mobile validation once a remote debugging environment is available.
4. Integrate existing backend services (Routes + Upload flow).

## Collaboration Rules

- One owner per write scope.
- Do not silently expand scope.
- If repo truth conflicts with assumptions, record the mismatch in the task result.
- Always list files touched or reviewed.
- Reviewer agent label is `gemini`.
