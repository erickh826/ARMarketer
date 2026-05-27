# TASK-006 Validation — codex (verifier)

## 1. Summary

- **Verdict: FAIL**
- `tsc` acceptance could not be closed in this shell environment:
  - `npx tsc -p tsconfig.server.json --noEmit` -> exit `1`
  - `.\node_modules\.bin\tsc.cmd -p tsconfig.server.json --noEmit` -> exit `1`
- Source review found two acceptance mismatches in the implementation:
  1. project mismatch returns **422**, but the verifier checklist requires **409**
  2. `storageProvider` fallback logic is not "R2 else LOCAL"; it is currently "LOCAL if local, otherwise R2"

## 2. Files Touched Or Reviewed

### Touched
- `docs/agents/results/TASK-006-validation-cursor.md`

### Reviewed
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-006.md`
- `docs/agents/results/TASK-006-codex.md`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- `server/examples/next-app-router/lib/services.ts`

### Commands Run
- `npx tsc -p tsconfig.server.json --noEmit`
- `.\node_modules\.bin\tsc.cmd -p tsconfig.server.json --noEmit`
- `git diff --name-only`

## 3. Findings

### 3.1 TypeScript compile check

- `npx tsc -p tsconfig.server.json --noEmit`
  - exit code: `1`
  - error verbatim:

```text
npx:
Line |
   2 |  npx tsc -p tsconfig.server.json --noEmit
     |  ~~~
     | The term 'npx' is not recognized as a name of a cmdlet, function, script file, or executable program.
Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

- `.\node_modules\.bin\tsc.cmd -p tsconfig.server.json --noEmit`
  - exit code: `1`
  - error verbatim:

```text
'"node"' is not recognized as an internal or external command,
operable program or batch file.
```

- Result: compile verification is still **not closed** from this environment.

### 3.2 Acceptance checklist by source read

- `[x]` POST handler exists and is exported as a named export
- `[x]` Required fields validated: `projectId`, `sourceAssetId`, `name`, `storageKey`, `processedUrl`
- `[x]` `fileSizeBytes` validated when present (positive finite number, `<= 500MB`)
- `[x]` Uses `mediaAssetService.createDerivedAsset()` and does not call Prisma directly
- `[x]` `kind = MODEL_3D`, `processedFormat = glb`, `status = READY`, `sourceAssetId` linked
- `[ ]` `storageProvider = R2 (falls back to LOCAL when env not R2)`
  - current code:
    - `LOCAL` when `storageService.provider === 'LOCAL'`
    - otherwise always `R2`
  - this is not the same as "R2 else LOCAL" and will coerce non-local providers such as `S3` to `R2`
- `[x]` HTTP `201` on success
- `[x]` HTTP `400` on missing required fields
- `[x]` HTTP `413` on oversized `fileSizeBytes`
- `[x]` HTTP `404` when source asset not found (`error.message.includes('not found')`)
- `[ ]` HTTP `409` on project mismatch
  - current code returns `422` for `error.message.includes('same project')`
  - task file body says `422`, but the verifier checklist explicitly requires `409`
- `[x]` Response body includes `{ asset, lineage: { sourceAssetId, derivedAssetId } }`
- `[x]` `toJsonSafe()` wraps the response

### 3.3 Request type check

- `[x]` `RegisterDerivedAssetRequest` is exported from `server/examples/next-app-router/lib/services.ts`
- `[x]` Its fields match what the route expects:
  - `projectId`
  - `sourceAssetId`
  - `name`
  - `storageKey`
  - `processedUrl`
  - optional `fileSizeBytes`
  - optional `metadata`

### 3.4 Scope check

- `[x]` No changes were made in the TASK-006 implementation under `server/services/**`, `server/storage/**`, `prisma/**`, or `src/**`
- `[x]` No new dependency was added for this route work
- `[!]` Repo reality mismatch:
  - `git diff --name-only` currently shows `docs/plan/phase1-checklist.md` as modified in the worktree
  - this file is outside TASK-006 owned scope, but it does not appear to be part of the TASK-006 implementation itself

## 4. Risks / Unresolved

- **Compile verification unresolved:** `node` / `npx` are still unavailable in this shell, so acceptance criterion 5 remains unverified here.
- **HTTP status mismatch:** the route returns `422` on project mismatch, but the verifier checklist requires `409`.
- **Storage provider mapping mismatch:** current implementation forces any non-local provider to `R2`, which is broader than the required fallback rule.
- **Task spec inconsistency:** `docs/agents/tasks/TASK-006.md` says project mismatch should be `422`, while the verifier checklist says `409`. This needs a single source of truth before closing validation cleanly.

## 5. Recommended Next Step

1. Resolve the task-spec mismatch first:
   - choose whether project mismatch should be `409` or `422`
   - update either the route or the task/checklist so they agree
2. Tighten `storageProvider` logic so it matches the intended contract exactly:
   - `R2` when the active provider is `R2`
   - `LOCAL` otherwise, if that is the intended fallback
3. Re-run `tsc` in a shell where `node` is actually available, or explicitly record that compiler verification is being delegated to another environment.
