# TASK-007 Validation — copilot (verifier)

## 1. Summary

- **Verdict: PASS-WITH-WARNINGS**
- All required routes are mounted and structurally correct.
- Scope boundaries respected — no changes outside owned files.
- TypeScript on all underlying route `.ts` files: clean (tsc exit 0, verified in TASK-006).
- `index.js` itself has no language server errors.
- One open item: runtime smoke test has not been executed in any session
  (neither codex nor any verifier had a Node-capable shell).

## 2. Files Touched or Reviewed

### Reviewed
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-007.md`
- `docs/agents/results/TASK-007-codex.md`
- `server/examples/express-host/index.js`
- `package.json`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`
- `server/examples/next-app-router/app/uploads/[...path]/route.ts`
- `server/examples/next-app-router/app/api/projects/[slug]/experience/route.ts`

### Touched
- `docs/agents/results/TASK-007-validation-copilot.md`

## 3. Findings

### 3.1 Required routes — all present

| Route | Required | Status |
|---|---|---|
| `POST /api/assets/upload` | ✅ required | ✅ mounted |
| `POST /api/assets/derived` | ✅ required | ✅ mounted |
| `PUT /uploads/*` | ✅ required | ✅ mounted (regex `/^\/uploads\/(.+)$/`) |
| `GET /uploads/*` | ✅ required | ✅ mounted (regex `/^\/uploads\/(.+)$/`) |
| `GET /api/projects/:slug/experience` | optional | ✅ mounted (bonus) |
| `GET /healthz` | not in task | ✅ added (safe addition, useful for smoke test) |

### 3.2 Service layer preserved

- `[x]` `index.js` only imports from `../next-app-router/app/api/...` — no logic rewrite
- `[x]` Zero direct Prisma calls in `index.js`
- `[x]` No changes to `server/services/**`, `server/storage/**`, `prisma/**`, `src/**`, `pipeline/**`

### 3.3 Dependencies

- `[x]` `express ^5.1.0` added to `dependencies` in `package.json`
- `[x]` `tsx ^4.20.6` added to `devDependencies`
- `[x]` `dev:example-host` script added: `tsx server/examples/express-host/index.js`
- `[x]` No other dependencies added

### 3.4 Implementation correctness

- `[x]` `ensureLocalStorageDefaults()` sets `ASSET_STORAGE_PROVIDER=LOCAL` + correct localhost URLs before routes initialize — prevents `storageService` from failing without env config
- `[x]` Fetch `Request` bridge (`createRequest`) correctly passes headers and body to route handlers
- `[x]` `sendFetchResponse` correctly mirrors status + headers + body back to Express `res`
- `[x]` `uploadPathContext` splits `req.params[0]` by `/` matching the Next.js `[...path]` array contract
- `[x]` `projectSlugContext` wraps `req.params.slug` in `Promise.resolve` matching the Next.js dynamic segment contract
- `[x]` 4-arg Express error handler present (handles `SyntaxError` → 400, all others → 500)
- `[x]` `app.disable('x-powered-by')` — correct security hygiene
- `[!]` `index.js` imports `.ts` files by explicit `.ts` extension — valid under `tsx` runner, but will fail under bare `node`. Acceptable for Phase 1 example scope; must not be used in production host.

### 3.5 Scope check

- `[x]` `src/**` — untouched
- `[x]` `pipeline/**` — untouched
- `[x]` `prisma/**` — untouched
- `[x]` `server/services/**` — untouched
- `[x]` `server/storage/**` — untouched
- `[x]` `docs/agents/tasks/TASK-001*.md` through `TASK-006*.md` — untouched

### 3.6 Runtime smoke test — NOT completed

- codex: no Node in PATH
- copilot (this verifier): Plan mode, cannot execute terminal commands
- Status: **structurally verified only**

## 4. Risks / Unresolved

- **Runtime not verified**: `npm run dev:example-host` has never been executed. It is possible the dynamic `import()` of `.ts` files fails at runtime even under `tsx` if module resolution order matters with the bootstrapped env vars. Low probability but unconfirmed.
- **`npm install` not run**: `express` and `tsx` are declared in `package.json` but may not be installed in `node_modules` yet if `npm install` was not run since the file was modified.
- **`.ts` import extension in `.js`**: Will break if runner is ever changed from `tsx` to plain `node`. Document this constraint.
- **No auth, rate limiting, or graceful shutdown**: Noted in codex result. Acceptable for Phase 1 example scope — must not be deployed as-is.

## 5. Recommended Next Step

1. **Run `npm install`** to ensure `express` and `tsx` are present in `node_modules`.
2. **Start the host**: `npm run dev:example-host` — confirm it starts and `/healthz` returns 200.
3. **Smoke test the flow** in order:
   - `POST /api/assets/upload` with `{projectId, originalFilename, mimeType, kind}` → expect 201
   - `PUT /uploads/<storageKey>` with binary body → expect 200
   - `POST /api/assets/derived` with `{projectId, sourceAssetId, name, storageKey, processedUrl}` → expect 201 with `lineage.sourceAssetId`
4. **Update `phase1-checklist.md` W4 items** once smoke test passes:
   - `[x] Example routes integrated into a real app host`
   - `[x] Upload smoke test passed on actual host`