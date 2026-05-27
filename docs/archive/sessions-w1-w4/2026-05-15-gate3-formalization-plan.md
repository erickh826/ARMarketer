# Gate 3 Formalization Plan — 2026-05-15

## 1. Objective
Formalize the Phase 1 3D asset pipeline, storage strategy, and acceptance criteria to ensure repeatable, high-quality delivery of optimized GLB assets.

## 2. Official Pipeline (Phase 1)
Due to current environment constraints and the successful preliminary results of TASK-003, the **Docker-free lightweight path** is declared the primary official pipeline for Phase 1.

### Primary Path: Python Trimesh + gltf-transform
- **Step 1 (Conversion):** `pipeline/scripts/convert_trimesh.py` (OBJ -> GLB)
- **Step 2 (Optimization):** `gltf-transform optimize` (Draco + WebP + Texture Resize)
- **Rationale:** Proven 98.5% size reduction (171MB -> 2.62MB) with minimal dependencies.

### Fallback/Advanced Path: Docker + Blender
- **Status:** Secondary / Future-facing.
- **Usage:** Reserved for complex mesh repair, custom PBR material mapping, or headless batch processing when Docker is available.

## 3. Storage Strategy (Cloudflare R2)
Large binaries will be moved out of the Git repository to prevent bloat and stay within Vercel Hobby limits.

- **Git Repo (`public/test-assets/`):**
  - Small smoke-test assets (< 10MB).
  - Essential metadata and viewer logic.
- **Cloudflare R2:**
  - **Source Packages:** Original high-poly ZIPs/OBJs (e.g., 80MB+ factory source).
  - **Stress Assets:** Large unoptimized stress-test models (e.g., `cyberpunk_city.glb`).
  - **Pipeline Intermediate:** Raw exported GLBs before final optimization.

## 4. Lineage and Metadata Tracking
Every optimized asset must be traceable back to its source via the Prisma `MediaAsset` model.
- **Source Asset:** `MediaAsset` record with `status: READY`, `kind: MODEL_3D`.
- **Derived Asset:** `MediaAsset` record where `sourceAssetId` points to the source, and `processedUrl` points to the R2-hosted optimized GLB.

## 5. Remaining Gate 3 Evidence Tasks
To move from "preliminary-evidence-recorded" to "formal-acceptance":
1. **Visual Smoke Test:** Render `factory-lod0-opt.glb` in the browser and capture visual quality screenshots.
2. **Hardening:** Add basic error handling to `convert_trimesh.py`.
## 6. Next Smallest Executable Task
- **Action:** Point the application to `factory-lod0-opt.glb` and perform a viewer smoke test.
- **Deliverable:** Visual screenshot evidence and a confirmation note of successful interaction (rotate/zoom) without console errors.
