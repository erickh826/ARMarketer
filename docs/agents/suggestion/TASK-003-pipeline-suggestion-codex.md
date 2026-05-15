# TASK-003 Pipeline Suggestion — codex

## 1. Summary

- **Verdict: SUCCESS with repo-truth conflicts** — First real OBJ → GLB conversion case executed. Final optimized artifact is 2.62 MB (well under the 10 MB target), structurally valid, and the viewer build passes.
- The repo's Docker/Blender pipeline could not be used (Docker not available on this machine), so alternative tools were employed. The pipeline skeleton's approach (Draco + texture compression) was replicated faithfully.
- Conversion workflow: **trimesh** (OBJ loading) → **gltf-transform v3** (Draco + WebP + mesh simplification).
- Artifact: `pipeline/output/20251228_004_RC_LOD0_opt.glb` (2.62 MB), also copied to `public/test-assets/factory-lod0-opt.glb`.

## 2. Files Touched or Reviewed

### Touched (created/modified)
- `pipeline/input/20251228_004_OUTPUT_LOD03/` — extracted OBJ source (unpacked from zip)
- `pipeline/output/20251228_004_RC_LOD0.glb` — raw obj2gltf output (89.98 MB, validation errors)
- `pipeline/output/20251228_004_RC_LOD0_trimesh.glb` — trimesh GLB output (73.78 MB, clean)
- `pipeline/output/20251228_004_RC_LOD0_opt.glb` — **final optimized artifact** (2.62 MB, Draco + WebP)
- `pipeline/scripts/convert_trimesh.py` — alternative conversion script (created)
- `public/test-assets/factory-lod0-opt.glb` — viewer-ready copy of optimized GLB
- `src/App.tsx` — updated to point to factory-lod0-opt.glb for TASK-003 testing
- `docs/agents/results/TASK-003-codex.md` — this file

### Reviewed (read-only)
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-003.md`
- `docs/plan/pipeline-asset-flow.md`
- `docs/plan/phase_plan/phase1.md`
- `docs/plan/validation.md`
- `pipeline/run_convert.sh`
- `pipeline/scripts/convert.py`
- `pipeline/Dockerfile`
- `prisma/schema.prisma`
- `server/services/media-asset.service.ts`
- `resources/factory-industrial-installation/source/20251228_004_OUTPUT_LOD03.zip`
- `src/App.tsx` (read existing state before modifying)

### Scope check
- No changes to `server/**`, `prisma/**`, `docs/agents/tasks/TASK-001*.md`, `docs/agents/tasks/TASK-002*.md` — scope boundary respected.

## 3. Findings

### 3.1 Source Asset

| Property | Value |
|---|---|
| Zip size | 82.88 MB |
| Extracted OBJ | 116 MB (`20251228_004_RC_LOD0.obj`) |
| Extracted texture | 55 MB (8,192×8,192 PNG) |
| Extracted MTL | 164 bytes |
| Vertex count | 789,008 |
| Face count | 977,523 |
| Materials | 1 (standard diffuse) |

### 3.2 Conversion Attempts

#### Attempt A: Docker/Blender (blocked)
- Docker not installed on this machine — **blocked**.
- This is a repo-truth conflict: the pipeline skeleton assumes Docker availability, but the current environment does not have it.
- `convert.py` (Blender Python script) could not be executed.

#### Attempt B: obj2gltf (partial success)
- Tool: `obj2gltf` (npm, v1.2.1)
- Command: `obj2gltf -i <obj> -o <output> -b --checkTransparency`
- Duration: ~6 seconds
- Output: 89.98 MB GLB (embedded 55 MB PNG texture)
- **Issue**: Produced GLB with validation errors — accessor 1 (NORMALS) had `null` min/max and NaN values. This prevented subsequent `gltf-transform` v4 optimization. Artifact kept for reference but not used as final.

#### Attempt C: trimesh + gltf-transform (success)
- **Step 1 — OBJ → GLB**: Python `trimesh`
  - Command: `python pipeline/scripts/convert_trimesh.py <input.obj> <output.glb>`
  - Duration: 12.5s (8.4s load, 4.1s export)
  - Output: 73.78 MB (slightly smaller than obj2gltf due to different encoding)
  - Validation: Clean — no errors, minor `BUFFER_VIEW_TARGET_MISSING` hints only
- **Step 2 — Optimization**: `gltf-transform` v3.10.1 (v4.3.0 failed with `getLogger` null errors)
  - Command: `gltf-transform optimize <input> <output> --compress draco --texture-compress webp --texture-size 2048`
  - Duration: ~6.5s
  - Output: **2.62 MB**
  - Optimizations applied: dedup (2ms), instance (0ms), palette (1ms), flatten (1ms), join (0ms), weld (2,184ms), simplify (1,407ms), resample, prune (963ms), sparse (115ms), textureCompress to WebP (1,849ms), draco (1ms)
  - Texture: 8192×8192 PNG → ≤2048px WebP
  - Vertices: 789,008 → 733,526 (7% simplified)
  - Extensions: `KHR_draco_mesh_compression`, `EXT_texture_webp`

### 3.3 Before/After Size Comparison

| Stage | Format | Size | Reduction |
|---|---|---|---|
| Source (zipped) | ZIP (OBJ + PNG) | 82.88 MB | — |
| Source (extracted) | OBJ + PNG | 171 MB | — |
| Raw GLB (obj2gltf) | GLB (embedded PNG) | 89.98 MB | 47% from extracted |
| Raw GLB (trimesh) | GLB (embedded PNG) | 73.78 MB | 57% from extracted |
| **Optimized GLB** | **GLB (Draco + WebP)** | **2.62 MB** | **98.5% from extracted, 96.4% from trimesh** |

The optimized output (2.62 MB) is 74% below the <10 MB Gate 3 target.

### 3.4 Viewer Compatibility

| Check | Result |
|---|---|
| GLB structure | Valid glTF 2.0 binary (magic `glTF`, version 2, length matches) |
| Draco extension | `KHR_draco_mesh_compression` — viewer supports via `useGLTF(url, true)` |
| WebP texture | `EXT_texture_webp` — supported by modern browsers (Chrome/Firefox/Edge) |
| Build with GLB path | `tsc -b && vite build` passes (570 modules, 3.5s) |
| Runtime smoke test | **Not executed** — build succeeds but no browser was opened |

### 3.5 Repo-Truth Conflicts

1. **Docker not available**: The `pipeline/run_convert.sh` and `pipeline/Dockerfile` assume Docker, but this environment does not have it. A Docker-free conversion path was proven using trimesh + gltf-transform.
2. **gltf-transform v4 incompatibility**: v4.3.0 fails on this GLB with `getLogger` null errors (likely a Node.js env issue). v3.10.1 works. If the Docker image's `gltf-transform` v4 also fails, the pipeline may need to pin v3.
3. **Blender not available**: The `pipeline/scripts/convert.py` Blender script could not be tested. It's unclear whether the Blender path would produce a compatible GLB for subsequent gltf-transform steps.

## 4. Risks / Unresolved

| Risk | Severity | Detail |
|---|---|---|
| No runtime rendering test | **Medium** | Build passes but no browser smoke test performed. Draco + WebP loading in drei/three.js should work, but needs confirmation. |
| Alternative toolchain | **Medium** | The pipeline uses trimesh + gltf-transform instead of the planned Docker/Blender stack. This is a proven working path but diverges from the repo's pipeline skeleton. |
| gltf-transform v4 vs v3 | **Low** | v4.3.0 fails on this GLB, v3.10.1 works. The Dockerfile installs `@gltf-transform/cli` (latest, likely v4). May need version pinning. |
| Mesh simplification quality | **Low** | 7% vertex reduction is conservative. No visual quality assessment performed. |
| Single-material case | **Low** | The factory asset has one material/texture. Multi-material OBJs may need different handling. |
| WebP browser support | **Low** | All target browsers support WebP, but offline/legacy environments may not. |

## 5. Recommended Next Step

1. **Run manual viewer smoke test** — start `npm run dev`, open browser, verify the factory GLB renders with correct textures, Draco decoding works, and OrbitControls function.
2. **Record visual quality** — take a screenshot of the rendered factory model for Gate 3 evidence. Compare against source OBJ rendering if possible.
3. **Evaluate pipeline toolchain decision**:
   - Option A: Get Docker working and validate the existing Blender → gltf-transform path
   - Option B: Formalize the trimesh → gltf-transform path as a Docker-free alternative, possibly writing a run_convert.py that replaces run_convert.sh
4. **Test pipeline reproducibility** — run the full conversion workflow again to confirm it produces identical results.
5. **Proceed to Gate 3 formal evidence** — once runtime smoke test passes, this artifact meets Gate 3 size/format requirements and can be used as viewer test evidence.
6. **Pin gltf-transform version** — update the Dockerfile or convert script to use gltf-transform v3 until v4 compatibility is verified.
