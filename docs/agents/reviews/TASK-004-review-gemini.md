# TASK-004 Review — Formalizing Gate 3 & R2 Strategy

## 1. Summary

**Verdict: HIGHLY RECOMMENDED.** 
`TASK-004` is a critical transition task that moves the project from "adhoc success" (TASK-003 preliminary results) to a "repeatable production architecture." The proposed split between GitHub/Vercel (metadata/smoke assets) and Cloudflare R2 (large binaries) is the correct architectural choice to avoid repo bloat and Vercel hobby limits.

## 2. Files Touched or Reviewed

### Reviewed
- `docs/agents/tasks/TASK-004.md`
- `docs/agents/results/TASK-004-codex.md`
- `docs/session/2026-05-15-gate3-preliminary-report.md`
- `docs/agents/suggestion/TASK-003-pipeline-suggestion-codex.md`
- `docs/plan/pipeline-asset-flow.md`
- `pipeline/scripts/convert_trimesh.py`
- `prisma/schema.prisma`
- `server/services/media-asset.service.ts`

## 3. Findings

### 3.1 Gate 3 Formalization Scope
The scope is accurate. The preliminary report shows we already hit the **98.5% size reduction** target (171MB -> 2.62MB), which is the core technical risk. Formalizing this into a "Gate 3 Result" requires closing the loop on:
- **Lineage Proof:** Linking the `MediaAsset` records for the source and derived assets.
- **Official Path:** Deciding if `trimesh` + `gltf-transform` (Docker-free) is a fallback or the primary engine.

### 3.2 Asset Split Strategy (Repo vs R2)
The proposed split is highly sensible:
- **Repo (`public/test-assets/`):** Small optimized GLBs (<10MB) for dev smoke tests. This keeps the Vite dev experience fast.
- **Cloudflare R2:** Large source packages (80MB+), raw intermediate GLBs, and stress-test assets.
**Assumption Check:** The current `MediaAssetService` already supports `StorageProvider.R2`, making this strategy immediately implementable.

### 3.3 Pipeline Toolchain Decision
The preliminary evidence used a "Docker-free" path (`trimesh` + `gltf-transform`) because Docker/Blender was unavailable. 
- **Finding:** The Docker-free path produced a **2.62MB** artifact that is extremely clean.
- **Recommendation:** Docker/Blender should be kept as a **Secondary/Advanced path** (for complex mesh cleanup) while the Python-native `trimesh` path should be formalized as the **Primary lightweight engine** for Phase 1.

### 3.4 Missing Prerequisite
Before final Gate 3 acceptance, we need a **Quality Verification Method**. Size reduction is proven, but visual fidelity (especially textures after WebP/Draco) hasn't been "signed off" by a visual check in the viewer.

## 4. Risks / Unresolved

- **Lineage Implementation:** While `MediaAssetService` has `sourceAssetId`, the actual logic for a "Pipeline Job" writing these back to the DB is not yet integrated.
- **Draco/WebP Support:** The optimized output requires `KHR_draco_mesh_compression` and `EXT_texture_webp`. We must ensure the `ModelViewer` correctly initializes these.
- **R2 Connectivity:** The Vite app needs a way to resolve R2 public URLs for large assets without exposing secrets or hitting CORS issues.

## 5. Recommended Next Step

1. **Approve TASK-004 formalization plan.**
2. **Execute a "Visual Acceptance" task:** Run the `factory-lod0-opt.glb` in the browser viewer and capture a screenshot for the Gate 3 report.
3. **Formalize the "No-Docker" path:** Update `pipeline/README.md` to document the `trimesh` path as the primary workflow for Phase 1.
4. **Linkage Proof:** Demonstrate the lineage tracking defined in `docs/plan/pipeline-asset-flow.md` via a mock or record.
