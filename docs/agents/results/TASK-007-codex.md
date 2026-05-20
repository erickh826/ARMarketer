# TASK-007 Result — codex (implementer)

## 1. Summary

- **Verdict: implemented**
- Added a runnable Express host boundary under `server/examples/express-host/`.
- The host mounts the existing example route logic for:
  - `POST /api/assets/upload`
  - `POST /api/assets/derived`
  - `PUT /uploads/*`
  - `GET /uploads/*`
  - `GET /api/projects/:slug/experience`
- Added the minimal package-level runtime required to start that host:
  - `express`
  - `tsx`
  - script: `npm run dev:example-host`

## 2. Files Touched Or Reviewed

### Touched
- `server/examples/express-host/index.js`
- `package.json`
- `docs/agents/results/TASK-007-codex.md`

### Reviewed
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-007.md`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`
- `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- `server/examples/next-app-router/app/api/projects/[slug]/experience/route.ts`
- `package.json`

## 3. Findings

- The repo did not have any runnable host boundary for the example asset flow.
- The existing Next-style route modules were already close to reusable; the main missing piece was a thin adapter from Express request/response objects into Fetch `Request` / `Response`.
- `package.json` did not include `express`, and there was no TypeScript/ESM runtime helper to start a standalone server from source. That is why `tsx` was added alongside `express`.
- The host now keeps the existing service layer as the source of truth by importing and invoking the existing route handlers instead of re-implementing backend logic.
- Default local-storage env behavior is set at bootstrap time when missing:
  - `ASSET_STORAGE_PROVIDER=LOCAL`
  - `LOCAL_UPLOAD_BASE_URL=http://localhost:<port>/uploads`
  - `LOCAL_PUBLIC_BASE_URL=http://localhost:<port>/uploads`

## 4. Risks / Unresolved

- I did not run the host in this shell. This environment still lacks a usable Node runtime in PATH, so runtime verification remains external.
- Adding `express` and `tsx` changes `package.json`, but dependencies are not installed from this session.
- `TASK-006` verifier still flagged a status-code/spec mismatch on the derived route (`409` vs `422`). This host mounts the existing route behavior as-is; it does not resolve that underlying route issue.
- The host is intentionally example-scoped and not production-hardened:
  - no auth
  - no rate limiting
  - no structured logging
  - no graceful shutdown wiring

## 5. Recommended Next Step

1. Install the new dependencies in a Node-capable environment.
2. Start the host with `npm run dev:example-host`.
3. Exercise the flow in order:
   - `POST /api/assets/upload`
   - `PUT /uploads/*`
   - `POST /api/assets/derived`
   - optional `GET /api/projects/:slug/experience`
4. After runtime verification, open reviewer and verifier passes for `TASK-007`.
