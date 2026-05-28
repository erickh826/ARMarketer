# TASK-008 Validation — codex (verifier)

## 1. Summary

- **Verdict: FAIL**
- `npm run typecheck:server` passed cleanly.
- Source review shows the intended W5 ImageTarget routes are present and mounted in the Express host.
- Runtime verification did **not** pass:
  - the existing host on `localhost:3001` did not expose `/api/targets` at all
  - a fresh host started on `localhost:3002` exposed the new code, but CRUD/auth requests failed with HTTP `500`
  - the failing path is inside `requireApiKey()` at `server/examples/next-app-router/lib/api-key-auth.ts:14`, during `prisma.project.findUnique(...)`

## 2. Files Touched Or Reviewed

### Touched
- `docs/agents/results/TASK-008-validation-codex.md`

### Reviewed
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-008.md`
- `server/examples/next-app-router/app/api/targets/route.ts`
- `server/examples/next-app-router/app/api/targets/[id]/route.ts`
- `server/examples/next-app-router/app/api/targets/[id]/compile/route.ts`
- `server/examples/next-app-router/lib/api-key-auth.ts`
- `server/examples/express-host/index.js`
- `server/services/image-target.service.ts`

### Commands Run
- `npm run typecheck:server`
- `Invoke-WebRequest http://localhost:3001/healthz`
- `git diff --name-only`
- started a fresh host on `localhost:3002`
- `Invoke-WebRequest http://localhost:3002/healthz`
- runtime CRUD/auth checks against `http://localhost:3002/api/targets`

## 3. Findings

### 3.1 TypeScript check

- `npm run typecheck:server` -> **exit 0**
- Output ended with:
  - `Generated Prisma Client (v7.8.0)`
  - `typecheck:server`
  - `tsc -p tsconfig.server.json --noEmit`
  - `Loaded Prisma config from prisma.config.ts.`
  - `Prisma schema loaded from prisma\\schema.prisma.`

### 3.2 Source review

The implementation is structurally coherent:

- `POST /api/targets` and `GET /api/targets?projectId=` exist in [targets/route.ts](D:\3D\3d_model\my-react-ts-app\server\examples\next-app-router\app\api\targets\route.ts)
- `GET/PATCH/DELETE /api/targets/:id` exist in [[id]/route.ts](D:\3D\3d_model\my-react-ts-app\server\examples\next-app-router\app\api\targets\[id]\route.ts)
- `POST /api/targets/:id/compile` exists in [[id]/compile/route.ts](D:\3D\3d_model\my-react-ts-app\server\examples\next-app-router\app\api\targets\[id]\compile\route.ts)
- `requireApiKey()` is applied across the target routes
- Express host mounts all 6 target routes in [express-host/index.js](D:\3D\3d_model\my-react-ts-app\server\examples\express-host\index.js)
- CORS headers include:
  - `GET, PUT, POST, PATCH, DELETE, OPTIONS`
  - `Content-Type, x-api-key`
- No service-layer or schema changes were required for TASK-008 route logic itself

### 3.3 Runtime mismatch: existing host on 3001 is stale

- `GET http://localhost:3001/healthz` returned `{"ok":true,"storageProvider":"LOCAL"}`
- But runtime checks against `localhost:3001` returned:
  - `Cannot POST /api/targets`
  - `Cannot GET /api/targets`
- This means the already-running host on `3001` is not serving the current TASK-008 code.

This conflicts with the task’s implied runtime state that the mounted routes are already verified on the active Express host.

### 3.4 Runtime verification against fresh host on 3002 failed

I started a fresh host instance on `localhost:3002` from the current repo state. It came up successfully:

- `GET http://localhost:3002/healthz` -> `{"ok":true,"storageProvider":"LOCAL"}`

But the CRUD/auth flow failed immediately:

- `POST /api/targets` with:
  - `projectId=001`
  - `x-api-key=test-key-001`
  - valid JSON body
- Result: **HTTP 500**

Exact response body:

```json
{"error":"\nInvalid `prisma.project.findUnique()` invocation in\nD:\\3D\\3d_model\\my-react-ts-app\\server\\examples\\next-app-router\\lib\\api-key-auth.ts:14:40\n\n  11   request: Request,\n  12   projectId: string,\n  13 ): Promise<Response | null> {\n→ 14   const project = await prisma.project.findUnique(\n"}
```

This same failure also caused:

- `GET /api/targets?projectId=001` -> **500**
- unauthenticated `POST /api/targets` -> **500** instead of the required **401**

Because create/list/auth fail at the auth helper layer, I could not complete a successful end-to-end:

- create -> get -> patch -> compile -> delete

### 3.5 Acceptance status

Acceptance criteria status from this verification:

1. `typecheck:server` passes with zero errors. **PASS**
2. `POST /api/targets` creates a record and returns `201`. **FAIL** (`500`)
3. `GET /api/targets?projectId=001` returns an array. **FAIL** (`500`)
4. `GET /api/targets/:id` returns target or `404`. **NOT REACHED**
5. `PATCH /api/targets/:id` updates allowed fields. **NOT REACHED**
6. `DELETE /api/targets/:id` returns `204`. **NOT REACHED**
7. `POST /api/targets/:id/compile` returns `200` with `stub: true`. **NOT REACHED**
8. Write routes return `401`/`403` without valid `x-api-key`. **FAIL** (`500` in current runtime path)
9. No changes to `server/services/**`, `prisma/**`, or `src/**`. **PASS** for TASK-008 route implementation scope

## 4. Risks / Unresolved

- **Primary blocker:** `requireApiKey()` currently fails at runtime on `prisma.project.findUnique(...)`, so all authenticated target routes are effectively broken.
- **Stale host risk:** the host currently running on `localhost:3001` is not serving the latest TASK-008 routes, which can easily produce false negatives/positives during manual testing.
- **Assumption conflict with task file:** TASK-008 states the routes were mounted and verified, but current runtime verification from the repo state did not confirm that.
- **Auth path ambiguity:** because the auth helper fails before returning a proper auth decision, I could not verify the intended `401` / `403` behavior from the running app.

## 5. Recommended Next Step

1. Fix the runtime failure in `server/examples/next-app-router/lib/api-key-auth.ts` / Prisma access path first.
   - The immediate failing operation is `prisma.project.findUnique({ where: { id: projectId }, select: { apiKey: true } })`.
2. Ensure the active verification host is restarted from the latest repo state before retesting.
   - The `localhost:3001` process is stale relative to TASK-008 source code.
3. Re-run TASK-008 verifier runtime checks after the auth helper issue is fixed:
   - create -> get -> patch -> compile -> delete
   - second compile -> `409`
   - missing `x-api-key` -> `401`
