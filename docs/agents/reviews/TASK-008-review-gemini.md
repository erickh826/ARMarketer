# TASK-008 Review (gemini)

## Summary
I reviewed the ImageTarget API implementation for TASK-008. The implementation successfully adds full CRUD operations and a Phase 1 compile stub. The routes are correctly mounted on the Express host with proper CORS configuration and auth protection.

## Files Touched/Reviewed
- `server/examples/next-app-router/app/api/targets/route.ts` (Reviewed)
- `server/examples/next-app-router/app/api/targets/[id]/route.ts` (Reviewed)
- `server/examples/next-app-router/app/api/targets/[id]/compile/route.ts` (Reviewed)
- `server/examples/express-host/index.js` (Reviewed)
- `docs/plan/phase1-checklist.md` (Reviewed)
- `docs/agents/tasks/TASK-008.md` (Reviewed)

## Findings

1. **Auth Consistency**: All 6 routes successfully implement the API key check via `requireApiKey(request, projectId)`.
2. **`resolveAndAuth` helper**: The `[id]/route.ts` correctly isolates the `findById -> check auth` flow. This correctly handles `404` when the target is missing and properly validates the key against the target's owning project.
3. **CORS Changes**: `server/examples/express-host/index.js` successfully updated `Access-Control-Allow-Methods` to include `PATCH` and `DELETE`, and `Access-Control-Allow-Headers` now includes `x-api-key`. These changes correctly enable browser preflight requests.
4. **Compile Stub**: `server/examples/next-app-router/app/api/targets/[id]/compile/route.ts` appropriately checks for a `PROCESSING` state (returning `409`) and updates the state directly to `READY` to support Phase 1 requirements, returning a helpful stub message.
5. **Type Safety**: `npm run typecheck:server` passed without errors.
6. **Integrity**: No changes were made to `server/services/**`, `prisma/**`, or `src/**`.
7. **Edge Cases Handled**: `physicalWidthCm` accepts `null` to clear the value in `PATCH` requests, as required.

## Risks / Unresolved
- The compile route directly transitioning to `READY` means any background job queue logic planned for Phase 2 will require modifying this endpoint. This is explicitly known and documented, but is a small architectural gap between the API and reality.
- The `DELETE` route does not attempt to cascade or remove associated assets in external storage (e.g. R2 or local disk). This is acceptable for Phase 1 where storage footprint is less of a concern.

## Recommended Next Step
Proceed with TASK-008 validation (`verifier` role) to empirically test the routes against `localhost:3001` via a smoke test.