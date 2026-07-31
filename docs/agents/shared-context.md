# Shared Context

> Last updated: 2026-07-31
> This file is the shared source of truth for external CLI agents working on this repo.

## Repo

- Name: `ARMarketer`
- Goal: build a Web AR/VR/3D marketing platform to replace Zapworks-dependent delivery

## Current Stage

- Phase: `Phase 1`
- Status: `W5 in progress`

## Current Truths

1. **Gate 1 PASSED (2026-05-21):** MindAR 1.2.5 A-Frame POC confirmed stable on iOS Safari and Android Chrome. Detection <8s, smooth stable overlay, no crashes. Evidence: `docs/session/2026-05-21-gate1-test-protocol.md`.
2. **Gate 2 PASS-WITH-WARNINGS:** Desktop and real-device mobile evidence exist for a ~136 MB GLB. iPhone 14 Safari + Pixel 6 Chrome loaded without crash, but load times were ~27-30s and no remote-debug trace was captured.
3. **Gate 3 PASSED:** Docker-free `trimesh` + `gltf-transform` pipeline is the official Phase 1 path. Optimized `factory-lod0-opt.glb` artifact: 2.62 MB from 171 MB OBJ source.
4. **W4 upload flow verified end-to-end (2026-05-20):** Express host (`server/examples/express-host/index.js`, `npm run dev:example-host`) runs on port 3001. Full smoke test passed: POST upload (201) → PUT binary (204) → POST derived (201) with `sourceAssetId` lineage → GET experience (200). DB: PostgreSQL `localhost:5432/armarketer` via `.env`.
5. **API key auth implemented:** `Project.apiKey` (nullable `String @unique`) guards `POST /api/assets/upload` and `POST /api/assets/derived`. Projects without an `apiKey` remain open. Middleware: `server/examples/next-app-router/lib/api-key-auth.ts`.
6. **R2 Decision:** Large source assets and pipeline outputs will be hosted on Cloudflare R2, not in Git.
7. **Service layer is complete:** `Project`, `MediaAsset`, `ImageTarget`, `ARExperience` services all exist and are tested. Prisma schema has `apiKey` on Project.
8. **Viewer skeleton** in `src/components/ModelViewer.tsx` supports OBJ, FBX, GLB. `src/App.tsx` supports `?url=` query-param targeting for local validation.
9. **W5 ImageTarget API baseline is complete:** `POST/GET /api/targets`, `GET/PATCH/DELETE /api/targets/:id`, and `POST /api/targets/:id/compile` are implemented and mounted; checklist records smoke test pass on 2026-06-04.
10. **W5 target-experience binding is complete:** `ARExperience` CRUD plus `/api/targets/:id/bind/:experienceId` and `/api/targets/:id/bind` are implemented and mounted on the Express host.
11. **Hotspot baseline exists in repo:** Prisma now defines `Hotspot`, the example host mounts `GET/POST /api/experiences/:id/hotspots` and `PATCH/DELETE /api/hotspots/:id`, and the React app contains `HotspotEditor.tsx`, `EditorCanvas.tsx`, and `EditorSidebar.tsx` behind `?editor=true`. Formal close-out docs for this baseline are still lagging.

## Primary Planning Files

- `docs/plan/phase1-checklist.md` — authoritative W1–W10 checklist (W1–W4 all `[x]`, W5 partially complete)
- `docs/plan/current-status.md` — workstream status and gate log
- `docs/plan/architecture.md` — stack and data model reference
- `docs/plan/pipeline-asset-flow.md` — pipeline data-flow diagram

## Current Recommended Priority

1. **W5 — Close hotspot baseline cleanly:** Treat hotspot schema/API/editor as present in repo, but verify local DB sync (`npx prisma db push` if needed) and reconcile any missing close-out docs.
2. **W6 — MindAR + React/R3F integration spike:** Embed MindAR in the React app (not just A-Frame POC) using the confirmed tracking library.
3. **W6 — Viewer reads CMS-backed experience:** `GET /api/projects/:slug/experience` drives the viewer instead of query-param assets.

## Collaboration Rules

- One owner per write scope.
- Do not silently expand scope.
- If repo truth conflicts with assumptions, record the mismatch in the task result.
- Always list files touched or reviewed.
- Reviewer agent label is `gemini`.
