# Backend Skeleton Review
> Reference: docs/plan/phase_plan/phase1.md
> Date: 2026-05-13

---

## What's Well-Aligned with Phase 1

| Area | Assessment |
|---|---|
| Schema models (Project / ImageTarget / ARExperience / MediaAsset) | Fully matches §3.2 data model requirements |
| `ImageTargetService.updateCompileStatus` | Directly supports W1/W3 MindAR `.mind` file compile tracking |
| `ARExperienceService.create` — cross-entity ownership validation in transaction | Good defensive boundary, prevents cross-project data leaks |
| `resolveReadyAsset` in media-asset.service — derived asset fallback chain | Correctly handles W3 pipeline output: raw → processed → ready |
| `getViewerConfigBySlug` eager-loads everything the viewer needs in one query | Supports W6 "Viewer reads from CMS" requirement cleanly |
| `StorageService` interface + Local/S3/R2 implementations | Covers W4 upload path; Local is sufficient to unblock dev before cloud setup |
| `toJsonSafe` BigInt serializer | Necessary since `fileSizeBytes` is `BigInt` in schema |
| Prisma singleton pattern in `prisma.ts` | Correct for Next.js dev hot-reload |

---

## Issues — Must Fix

### 1. `@server/*` path aliases are missing — `typecheck:server` will fail

`tsconfig.server.json` extends `./tsconfig.json` which is a project references file with no `compilerOptions`.
Neither file defines `paths` for `@server/*`. Every import in `services.ts` and the API routes uses this alias.

**Fix `tsconfig.server.json`:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "outDir": "dist/server",
    "rootDir": ".",
    "noEmit": true,
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "paths": {
      "@server/*": ["./server/*"]
    }
  },
  "include": [
    "prisma/**/*.ts",
    "src/lib/server/**/*.ts",
    "src/app/api/**/*.ts",
    "server/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

> `include` also needs `"server/**/*.ts"` — currently it only covers `src/lib/server/**` and `src/app/api/**` which don't exist; the actual files are under `server/`.

---

### 2. Upload route — no file size limit (security gap)

`server/examples/next-app-router/app/api/assets/upload/route.ts` passes `body.fileSizeBytes` straight through with no upper bound check.
An unbounded presigned PUT allows a client to request upload authorization for arbitrarily large files.

**Add a guard before issuing the `UploadAuthorization`:**

```ts
const MAX_UPLOAD_BYTES = 500 * 1024 * 1024 // 500 MB, adjust per Phase 1 FBX spec
if (body.fileSizeBytes && body.fileSizeBytes > MAX_UPLOAD_BYTES) {
  return Response.json({ error: 'File exceeds maximum allowed size.' }, { status: 413 })
}
```

---

## Issues — Minor / Worth Noting

### 3. `storage.service.ts` location inconsistency

The file lives in `server/storage/storage.service.ts` while all other services are in `server/services/`.
The import path in `services.ts` is `@server/storage/storage.service`. This works but breaks the folder convention.
**Action:** Either move to `server/services/storage.service.ts` and update the import, or explicitly document `storage/` as an intentional sub-folder boundary.

---

### 4. `LocalStorageService` has no matching server-side upload handler

`createUploadAuthorization` returns a computed PUT URL (`http://localhost:3000/uploads/...`) but there is no route accepting PUT requests at that path.
Local uploads will silently fail in W4 dev workflow.
**Action:** Add a local dev upload handler (Next.js route or Express middleware serving `public/uploads/`) as part of the W4 ticket.

---

### 5. `ImageTargetService` missing `bindExperience` method

The schema has `ImageTarget.boundExperienceId` — a 1:1 relation to lock a single experience to a target.
The service only exposes the generic `update()` for this, which does not enforce the same cross-project ownership validation that `ARExperienceService.create` applies.
Low risk for Phase 1 but will surface in W5 (ImageTarget management UI).

---

### 6. `StorageProvider.CDN` unhandled in factory — improve error message

The schema defines `CDN` as a valid `StorageProvider` but `createStorageServiceFromEnv` throws a generic error.

**Improve to:**

```ts
throw new Error(`Unsupported storage provider "${provider}". Valid options: LOCAL, S3, R2.`)
```

---

## Phase 1 Scope Gaps (Not Bugs — Tracking for Future Weeks)

| Gap | Phase 1 Week | Notes |
|---|---|---|
| No MindAR compile trigger / job queue | W1 | `updateCompileStatus` tracks state but nothing enqueues compilation. A placeholder `triggerCompile(id)` stub would make the W1 contract explicit. |
| No Blender pipeline job dispatch | W3 | `MediaAsset.processingJobId` exists on schema but no service method writes it. Expected gap — pipeline is a separate workstream. |
| No auth middleware on example routes | W5 | Correct for a skeleton/example. Auth is scheduled for W5 per the plan. Flag for the W5 ticket. |
| `ARExperience.contentType` vs `mediaAsset.kind` mismatch not validated | W6 | A `PANORAMA_360` experience could be linked to a `MODEL_3D` asset. Consider adding a type-match guard in `ARExperienceService.create`. |

---

## Summary

The skeleton is structurally sound and well-matched to the §3.2 CMS requirements.

**Priority actions before next CI step:**
1. Fix `tsconfig.server.json` — add `paths` and `server/**/*.ts` to `include` (blocks `typecheck:server`).
2. Add file size guard in the upload route (security gap).

Everything else is noted for the relevant phase week.
