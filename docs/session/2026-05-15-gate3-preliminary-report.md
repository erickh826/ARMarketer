# Gate 3 Preliminary Report — 2026-05-15

## Summary

This report captures the current **preliminary Gate 3 evidence** from the first real source-asset conversion case already executed in the repo workspace.

Current conclusion:

- **Preliminary conversion evidence recorded**
- **Formal Gate 3 acceptance still pending**

The repo now has a real OBJ-based source case, a successful optimized GLB output, and a documented before/after size comparison. However, Gate 3 is not yet fully accepted because runtime viewer validation, quality review, lineage proof, and a final formalized pipeline path are still missing.

---

## Source Asset

| Field | Value |
| :--- | :--- |
| Source package | `resources/factory-industrial-installation/source/20251228_004_OUTPUT_LOD03.zip` |
| Source type | OBJ + MTL + PNG |
| Zip size | 82.88 MB |
| Extracted OBJ | 116 MB |
| Extracted texture | 55 MB |
| Texture resolution | 8192 × 8192 |

---

## Conversion Workflow Observed

### Planned repo skeleton

- `pipeline/run_convert.sh`
- `pipeline/scripts/convert.py`
- `pipeline/Dockerfile`

### Actual executed path

- OBJ load via `trimesh`
- optimization via `gltf-transform v3`
- local output staged under `pipeline/output/`

### Repo-truth conflict

The planned Docker/Blender path could not be executed in the current machine because Docker was not available. A Docker-free alternative path still produced a successful optimized GLB and should be treated as **valid preliminary evidence**, but not yet as the final official pipeline contract.

---

## Output Artifacts

| Stage | Path | Size | Notes |
| :--- | :--- | :--- | :--- |
| Raw OBJ-derived GLB (`obj2gltf`) | `pipeline/output/20251228_004_RC_LOD0.glb` | 89.98 MB | Validation issues; not final |
| Raw GLB (`trimesh`) | `pipeline/output/20251228_004_RC_LOD0_trimesh.glb` | 73.78 MB | Clean intermediate |
| Optimized GLB | `pipeline/output/20251228_004_RC_LOD0_opt.glb` | 2.62 MB | Final optimized artifact |
| Viewer-ready copy | `public/test-assets/factory-lod0-opt.glb` | ~2.62 MB | Local viewer test asset |

---

## Before / After Size Comparison

| Stage | Format | Size | Reduction |
| :--- | :--- | :--- | :--- |
| Source (zipped) | ZIP | 82.88 MB | — |
| Source (extracted) | OBJ + PNG | 171 MB | — |
| Raw GLB (`obj2gltf`) | GLB | 89.98 MB | 47% from extracted |
| Raw GLB (`trimesh`) | GLB | 73.78 MB | 57% from extracted |
| Optimized GLB | GLB (Draco + WebP) | 2.62 MB | 98.5% from extracted |

This optimized output is **well under the <10 MB Gate 3 target**.

---

## Current Evidence Quality

### Already demonstrated

- A real repo source asset can be converted into an optimized GLB.
- The optimized GLB size is commercially promising.
- The current viewer build accepts the optimized GLB path configuration.

### Still missing for full Gate 3 acceptance

- runtime browser smoke test with the optimized artifact
- visual quality review / screenshot evidence
- formal source-asset -> derived-asset lineage proof
- decision on official pipeline path:
  - Docker/Blender path
  - or alternative Docker-free path

---

## Large Asset Storage Note

Because very large GLB assets are not appropriate for GitHub repo storage or Vercel Hobby static hosting, future large source assets and large converted test artifacts should be staged in **Cloudflare R2** or equivalent object storage instead of relying on repo-committed binaries.

Recommended split:

- Repo:
  - small smoke assets
  - lightweight viewer-ready artifacts
  - scripts and metadata
- R2:
  - 100MB+ stress assets
  - large source zips
  - large intermediate pipeline outputs

---

## Current Gate 3 Status

> **preliminary-evidence-recorded**

Gate 3 should currently be treated as:

- conversion success evidence exists
- size reduction evidence exists
- formal acceptance still pending

---

## Recommended Next Step

1. Run one browser smoke test using `factory-lod0-opt.glb`.
2. Capture screenshot-based quality evidence.
3. Decide whether Docker/Blender remains the official path, or whether a Docker-free fallback path should be supported.
4. Define Cloudflare R2 as the storage location for large pipeline inputs/outputs that should not live in Git/Vercel.
5. Then write the formal Gate 3 result and update checklist / status docs.
