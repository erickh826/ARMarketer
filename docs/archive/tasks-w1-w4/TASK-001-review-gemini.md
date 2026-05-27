# Task Review: TASK-001 — Add GLB support to ModelViewer

## Summary
TASK-001 is correctly identified as the highest-priority next step to bridge the gap between the W3 pipeline output (GLB) and the `ModelViewer`. The task is currently in a "partially implemented" state due to uncommitted changes in `src/components/ModelViewer.tsx` that already introduce `useGLTF`.

## Files Touched or Reviewed
- `docs/agents/tasks/TASK-001.md` (reviewed)
- `src/components/ModelViewer.tsx` (reviewed uncommitted changes)
- `package.json` (reviewed dependencies)
- `docs/plan/current-status.md` (reviewed)
- `docs/plan/phase1-checklist.md` (reviewed)
- `docs/session/2026-05-14-task-order.md` (reviewed)

## Findings
- **Implementation State:** `src/components/ModelViewer.tsx` already contains an uncommitted implementation of `GLBModel` using `useGLTF`. The task status in `TASK-001.md` should be updated from `todo` to `in-progress`.
- **Dependency Match:** The implementation correctly uses `@react-three/drei`'s `useGLTF`, which is already present in `package.json`.
- **Draco Support:** The current code uses `useGLTF(url, true)`, which attempts to use Draco. However, no local decoder path is set via `useGLTF.setDecoderPath()`. This relies on the Google CDN, which may be a risk for reliability or restricted networks.
- **Task Order Validation:** The task correctly precedes `TASK-002` (Gate 2 stress testing), as GLB is a primary target for Phase 1 optimization results.
- **Reality Check:** Backend services (`ProjectService`, `MediaAssetService`) already exist in `server/services/`, so future tasks must avoid "start skeleton" framing.

## Risks / Unresolved
- **Decoder Hosting:** Lack of locally hosted Draco/KTX2 decoders in `public/` is an architectural risk for production stability.
- **Sample Missing:** There is no documented GLB sample path in the repo to verify the uncommitted changes.
- **Commit Boundary:** The changes are uncommitted and unassigned to a specific git commit.

## Recommended Next Step
1.  **Commit Baseline:** Commit the existing GLB implementation to `src/components/ModelViewer.tsx` to establish a baseline.
2.  **Asset Validation:** Provide a small GLB asset (e.g., in `public/assets/test.glb`) for immediate validation.
3.  **Harden Backend Wording:** Explicitly rename all "Start backend" tasks to **"Harden and integrate existing backend Services"** to align with repo reality.
4.  **Proceed to TASK-002:** Once TASK-001 is committed and validated, proceed to the Gate 2 stress testing plan defined in TASK-002.
