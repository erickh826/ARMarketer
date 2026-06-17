# ARMarketer — Current Status

> Last updated: 2026-06-12
> Stage: **W5 in progress**

## Gate Summary

| Gate | Goal | Status | Evidence |
| :--- | :--- | :--- | :--- |
| Gate 1 | MindAR stable on target phones | `PASSED` | iOS Safari + Android Chrome stable, <8s detection, no crash — `docs/session/2026-05-21-gate1-test-protocol.md` |
| Gate 2 | 100MB-class asset loadability proven | `PASS-WITH-WARNINGS` | Desktop + real-device mobile (iPhone 14, Pixel 6) loaded ~136 MB GLB; ~27-30s load times, no crash — `docs/session/2026-05-14-gate2-report.md`, `docs/session/2026-05-14-gate2-mobile-report.md` |
| Gate 3 | Optimized GLB pipeline output accepted | `PASSED` | 171 MB OBJ → 2.62 MB GLB via Docker-free `trimesh` + `gltf-transform` — `docs/session/2026-05-15-gate3-report.md` |
| Gate 4 | 3 legacy cards rebuilt and accepted | `NOT STARTED` | W9 milestone |

## Workstream Status

### Done (W1–W4)

| Area | Status | Key Evidence |
| :--- | :--- | :--- |
| MindAR feasibility | Complete | Gate 1 PASSED, `public/poc.html` |
| GLB/OBJ/FBX viewer | Complete | `src/components/ModelViewer.tsx` |
| Prisma schema + services | Complete | `prisma/schema.prisma`, `server/services/**` |
| Conversion pipeline | Complete | `pipeline/scripts/convert_trimesh.py`, Gate 3 PASSED |
| MediaAsset lineage | Complete | `sourceAssetId` chain verified in smoke test |
| Upload/derived routes | Complete | `server/examples/next-app-router/app/api/assets/**` |
| Express host (runnable) | Complete | `server/examples/express-host/index.js`, port 3001 |
| W4 smoke test | Complete | POST→PUT→derived→experience all passed 2026-05-20 |
| API key auth | Complete | `Project.apiKey` + `lib/api-key-auth.ts` |

### Next (W5–W6)

| Area | Status | Planned |
| :--- | :--- | :--- |
| ImageTarget management API | Complete | CRUD + source image upload + `.mind` compile stub routes + smoke test passed |
| Target-experience binding | Complete | `ARExperience.imageTargetId` + `ImageTarget.boundExperienceId` wiring |
| MindAR + React/R3F integration | Not started | Embed tracking in React app, replace A-Frame POC |
| Viewer reads CMS data | Not started | `GET /api/projects/:slug/experience` drives the viewer |
| Hotspot editor UI | Not started | W5 follow-up |

## Immediate Truths for W5 Agents

1. The express host (`npm run dev:example-host`) is the runnable backend. DB is PostgreSQL at `localhost:5432/armarketer` (via `.env`).
2. Test project: `id=001`, `slug=smoke-test`, `apiKey=test-key-001`.
3. Write routes require `x-api-key` header when the project has an `apiKey` set.
4. MindAR library version is locked at **1.2.5** (the tested version). Do not upgrade without re-running Gate 1.
5. R2 credentials are a deploy-time concern. `LOCAL` storage is the dev default (`ASSET_STORAGE_PROVIDER=LOCAL`).
6. Archived W1–W4 task artifacts are in `docs/archive/tasks-w1-w4/` and `docs/archive/sessions-w1-w4/` — do not move them back.
