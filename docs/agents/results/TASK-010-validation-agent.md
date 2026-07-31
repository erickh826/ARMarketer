# TASK-010 Validation Report

- timestamp: 2026-06-17T09:35:16Z
- attempt: 2
- command: npm run typecheck:server
- exit_code: 0
- error_class: pass
- verdict: pass

## Stdout
```text

> ARMarketer@0.0.0 pretypecheck:server
> prisma generate


✔ Generated Prisma Client (v7.8.0) to .\node_modules\@prisma\client in 84ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)



> ARMarketer@0.0.0 typecheck:server
> tsc -p tsconfig.server.json --noEmit


```

## Stderr
```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.

```

---

## TASK-009 Endpoint Verification Checklist

Verified by reading route source and express-host registration. No live DB available at verification time (PostgreSQL not running locally); runtime behavior confirmed by code inspection.

### Auth Behavior

`requireApiKey` in `server/examples/next-app-router/lib/api-key-auth.js` returns `null` (no error) when `project.apiKey` is `null`. Auth is therefore **conditional**: projects with an API key set require `x-api-key` header; projects without one are open. All 7 endpoints use this conditional behaviour.

---

### Endpoint 1 — POST /api/experiences

Route: `server/examples/next-app-router/app/api/experiences/route.ts`  
Express registration: `app.post('/api/experiences', ...)`

| Check | Result |
|-------|--------|
| Returns 201 on valid create | ✓ — `return Response.json(toJsonSafe(created), { status: 201 })` |
| Required fields: projectId, name, contentType | ✓ — returns 400 if any missing |
| Auth: conditional on project.apiKey | ✓ — `requireApiKey(request, body.projectId)` after project lookup |
| 422 if imageTargetId / mediaAssetId from wrong project | ✓ — `ARExperienceService.create()` validates inside `$transaction` |
| 422 if projectId not found | ✓ — same transaction throws `Project not found` |

---

### Endpoint 2 — GET /api/experiences?projectId=...

Route: `server/examples/next-app-router/app/api/experiences/route.ts`  
Express registration: `app.get('/api/experiences', ...)`

| Check | Result |
|-------|--------|
| Returns 200 array for valid projectId | ✓ — `arExperienceService.listByProject(projectId)` |
| Returns 400 if projectId param missing | ✓ — explicit check before DB query |
| Auth: conditional on project.apiKey | ✓ — project lookup → `requireApiKey` |
| Includes nested imageTarget and mediaAsset | ✓ — `include: { imageTarget: true, mediaAsset: true }` in service |

---

### Endpoint 3 — GET /api/experiences/:id

Route: `server/examples/next-app-router/app/api/experiences/[id]/route.ts`  
Express registration: `app.get('/api/experiences/:id', ...)`

| Check | Result |
|-------|--------|
| Returns 200 with experience object | ✓ — `arExperienceService.findById(id)` |
| Returns 404 if id not found | ✓ — `resolveAndAuth` helper returns 404 when `findById` returns null |
| Auth: conditional on project.apiKey | ✓ — `resolveAndAuth` calls `requireApiKey` after findById |

---

### Endpoint 4 — PATCH /api/experiences/:id

Route: `server/examples/next-app-router/app/api/experiences/[id]/route.ts`  
Express registration: `app.patch('/api/experiences/:id', ...)`

| Check | Result |
|-------|--------|
| Returns 200 with updated object | ✓ — `arExperienceService.updateWithValidation(id, updateData)` |
| Returns 200 (no-op) if body has no updateable fields | ✓ — early return `toJsonSafe(experience!)` |
| Returns 404 if id not found | ✓ — `resolveAndAuth` |
| Returns 422 if imageTargetId from different project | ✓ — `updateWithValidation` validates inside `$transaction` |
| Returns 422 if mediaAssetId from different project | ✓ — same `updateWithValidation` path |
| Auth: conditional on project.apiKey | ✓ |

---

### Endpoint 5 — DELETE /api/experiences/:id

Route: `server/examples/next-app-router/app/api/experiences/[id]/route.ts`  
Express registration: `app.delete('/api/experiences/:id', ...)`

| Check | Result |
|-------|--------|
| Returns 204 No Content | ✓ — `new Response(null, { status: 204 })` |
| Returns 404 if id not found | ✓ — `resolveAndAuth` |
| Auth: conditional on project.apiKey | ✓ |

---

### Endpoint 6 — POST /api/targets/:id/bind/:experienceId

Route: `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts`  
Express registration: `app.post('/api/targets/:id/bind/:experienceId', ...)`  
Express context: `targetBindContext(req)` injects both `id` and `experienceId` into params.

| Check | Result |
|-------|--------|
| Returns 400 if experienceId path segment missing | ✓ — explicit check before service call |
| Returns 404 if targetId not found | ✓ — `imageTargetService.findById(targetId)` check |
| Auth: conditional on project.apiKey | ✓ — `requireApiKey(request, target.projectId)` |
| Validates experience belongs to same project | ✓ — inside `bindExperience` `$transaction` |
| Validates experience.imageTargetId matches target | ✓ — same transaction |
| Returns 409 if target already bound to a different experience (CAS) | ✓ — `BindConflictError` → `{ status: 409 }` |
| Returns 422 on other validation failures | ✓ — generic `Error` catch → 422 |
| Idempotent: re-binding same pair returns 200 | ✓ — `updateMany WHERE OR [null, same experienceId]` |

---

### Endpoint 7 — DELETE /api/targets/:id/bind

Route: `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts`  
Express registration: `app.delete('/api/targets/:id/bind', ...)`

| Check | Result |
|-------|--------|
| Returns 204 No Content | ✓ — `new Response(null, { status: 204 })` |
| Returns 404 if targetId not found | ✓ — `imageTargetService.findById(targetId)` check |
| Sets boundExperienceId to null | ✓ — `imageTargetService.unbindExperience(targetId)` |
| Auth: conditional on project.apiKey | ✓ |

---

## Summary

All 7 TASK-009 endpoints verified by source inspection:

- Auth is **conditional** (project.apiKey present → required, null → open).
- `422` validation uses same-project FK checks (imageTargetId, mediaAssetId) inside `$transaction`, not schema unique constraints.
- Bind (`POST /api/targets/:id/bind/:experienceId`) uses CAS `updateMany` — concurrent conflicting binds get **409**, not a silent last-write-wins.
- `npm run typecheck:server` exits 0 (Prisma client generated; tsc clean).
