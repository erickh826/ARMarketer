# TASK-001 Validation — deepseek (verifier)

## 1. Summary

- **Verdict: PASS with caveats** — GLB support is correctly implemented and the build succeeds.
- GLB loading branch (`GLBModel`) uses `useGLTF(url, true)` from `@react-three/drei`, with Draco decoding enabled.
- Existing OBJ and FBX branches are fully preserved; loading UI (`<Loader>`, `<Suspense>`) is untouched.
- **Repo-truth conflict**: Task `TASK-001.md` was authored *after* the GLB implementation was already committed (`25b1606`), meaning the task file retrospectively describes work that was already done. The implementer result (`TASK-001-cursor.md`) is therefore a retroactive write-up, not an implementation artifact.
- **Another metadata mismatch**: Task metadata says assigned agent is `codex`, but the actual implementer result was written by `cursor`. This is cosmetic but violates strict ownership tracking.

## 2. Files Touched or Reviewed

### Touched (by implementer — part of commit `25b1606`)
- `src/components/ModelViewer.tsx` — added `GLBModel`, `ModelContent`, and routing logic

### Reviewed (by verifier)
- `src/components/ModelViewer.tsx`
- `src/App.tsx`
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-001.md`
- `docs/agents/results/TASK-001-cursor.md`
- `docs/session/2026-05-14-task-order.md`

### Scope check
- No changes to `prisma/**`, `server/**`, or `pipeline/**` — scope boundary respected.

## 3. Findings

### 3.1 GLB Implementation correctness
| Check | Result |
|---|---|
| `type: 'glb'` in union | Already present since initial commit (`541fc71`) |
| GLB loader branch exists | `GLBModel` component at `ModelViewer.tsx:132-163` |
| Routing to GLB branch | `ModelContent` at `ModelViewer.tsx:179-185` correctly routes `glb` |
| Draco support | `useGLTF(url, true)` enables it; relies on drei's default CDN decoder |
| Cleanup/dispose | Matches OBJ/FBX pattern — traverses `gltf.scene`, disposes geometry and materials |
| OBJ/FBX preserved | `OBJModel` (lines 62–95) and `FBXModel` (lines 97–130) intact |
| Loading UI preserved | `<Loader>` component and `<Suspense>` boundary unchanged |
| Build | `tsc -b && vite build` passes (570 modules, 486ms) |

### 3.2 Repo-truth conflicts (per shared-context.md rules)
1. **Task-implementation ordering mismatch**: Git history shows GLB support was committed in `25b1606` ("update system plan"), while `TASK-001.md` was created in the later commit `60aac3e` ("agent flow and skill"). The task was therefore a retroactive description of already-completed work. The shared-context.md truth "GLB is the intended W3 pipeline output format, but the viewer does not fully support GLB yet" was stale at the time the task was authored.
2. **Agent label mismatch**: Task metadata says `codex`; implementer result file says `cursor`. This violates the "one owner per write scope" rule at the metadata level, though not at the code level.

### 3.3 Quality observations
- GLB path does NOT attempt to load textures from `textureUrl`/`normalUrl` props — correct, since GLB embeds its own textures.
- Cleanup pattern is consistent with OBJ/FBX, though it disposes `useGLTF`-cached resources; drei's cache may re-use them on remount. Acceptable for current scope.
- No `key` prop on GLB model to force re-mount on URL change — same as OBJ/FBX, not a regression.
- Removed `contactShadow={true}` from `<Stage>` during the refactor (diff `541fc71..25b1606`). Minor visual change but unrelated to GLB scope.

## 4. Risks / Unresolved

| Risk | Severity | Detail |
|---|---|---|
| No GLB sample asset | **Medium** | `public/` contains no `.glb` files; `App.tsx` has no GLB test path. This task is validated by build only. A manual smoke test with a real GLB (especially a W3 pipeline output) is still needed. |
| Draco decoder path | **Low-Medium** | `useGLTF(url, true)` uses drei's default CDN Draco decoder (`threejs.org`). No local fallback configured. Will fail in offline or restricted-network environments. A local draco decoder setup may be needed for production. |
| Task-STALE condition | **Process** | If other tasks also depend on the assumption that TASK-001 work is "pending," they may be operating on outdated assumptions. Recommend validating TASK-002 dependencies. |
| Loading UI text | **Low** | Loader text says "正在處理 100MB+ 模型" — this is hardcoded and not GLB-specific (pre-existing). |

## 5. Recommended Next Step

1. **Add a real GLB sample asset** (even a simple cube or a small pipeline test output) to `public/` and wire a test path in `src/App.tsx` for manual smoke testing.
2. **Run a manual viewer smoke test** with the GLB sample to verify render, controls, and cleanup behavior at runtime.
3. **Update `shared-context.md` truth #3** — the viewer now *does* support GLB; the shared truth is stale.
4. **Proceed to Task 2** (Gate 2 measurement evidence) once a GLB sample is available, since Gate 2 should ideally cover W3 target format.
5. **Optionally**, configure local Draco decoder files (copy from `three/examples/jsm/libs/`) and set `useGLTF.setDecoderPath()` or pass it via Drei's `Gltf` provider.
