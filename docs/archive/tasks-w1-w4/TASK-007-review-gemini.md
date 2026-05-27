# TASK-007 Review — gemini (reviewer)

## 1. Summary

- **Verdict: Approved**
- The implementation of the Express host boundary in `server/examples/express-host/` is well-architected, minimal, and fully satisfies the requirements of TASK-007.
- It successfully adapts the existing Next.js-style routes to a standalone Express server without duplicating logic, ensuring the service layer remains the single source of truth.
- The addition of `express` and `tsx` to `package.json` provides the necessary runtime environment for local development and testing of the W4 asset flow.

## 2. Files Touched or Reviewed

### Reviewed
- `server/examples/express-host/index.js` (Implementation)
- `package.json` (Dependencies and scripts)
- `docs/agents/tasks/TASK-007.md` (Task definition)
- `docs/agents/results/TASK-007-codex.md` (Implementer result)
- `server/examples/next-app-router/app/api/assets/upload/route.ts` (Adapted route)
- `server/examples/next-app-router/app/api/assets/derived/route.ts` (Adapted route)
- `server/examples/next-app-router/app/uploads/[...path]/route.ts` (Adapted route)
- `server/examples/next-app-router/app/api/projects/[slug]/experience/route.ts` (Adapted route)
- `server/storage/storage.service.ts` (Service layer usage)

## 3. Findings

- **Architectural Integrity:** The adapter pattern used in `index.js` (bridging Express `req`/`res` to Fetch `Request`/`Response`) is an excellent choice. It allows the project to maintain a single set of route logic while providing a runnable standalone host for the current phase.
- **Route Coverage:** All requested endpoints (`upload`, `derived`, `local uploads`, and `experience resolution`) are correctly mounted and accessible.
- **Developer Experience:** The `ensureLocalStorageDefaults` helper significantly simplifies local testing by auto-configuring environment variables to point back to the local host when they are not explicitly set.
- **Dependency Management:** The choice of `tsx` as a runner is appropriate for an ESM-based project that needs to execute TypeScript files directly without a complex build step.
- **Large File Support:** The implementation correctly configures `express.raw` with a `500mb` limit for the upload path, matching the internal limits of the service layer.

## 4. Risks / Unresolved

- **Node Runtime Environment:** As noted by the implementer, the host has not been runtime-verified in the current restricted agent environment. Final verification requires a standard Node.js environment with dependencies installed.
- **TS/JS Extension Interop:** The `index.js` uses direct `.ts` extension imports (e.g., `import(.../route.ts)`). While `tsx` supports this, it is non-standard for ESM and might require attention if the project moves away from `tsx` for execution. However, for an example host, this is acceptable.
- **Missing Auth:** The host is intentionally open (no authentication). This is acceptable for W4 development but must be addressed before any production or public-facing deployment.

## 5. Recommended Next Step

1. **Verification (TASK-007-verifier):** A verifier should now attempt to run `npm install` and `npm run dev:example-host` in a Node-capable environment to confirm route reachability and end-to-end functionality.
2. **Exercise Asset Flow:** Once the host is verified, the team can use it to perform the first "real" end-to-end asset flow test:
    - Authorize a source upload.
    - Perform the `PUT` to the local storage path.
    - Register a derived optimized GLB.
    - Resolve the experience payload to verify the lineage works.
3. **Checklist Update:** Upon successful verification, the corresponding items in `docs/plan/phase1-checklist.md` under **W4** should be marked as done.
