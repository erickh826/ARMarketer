# TASK-002 Validation — codex (verifier)

> Validated: 2026-05-14
> Role: verifier
> Agent: codex
> Scope: verify whether the TASK-002 Gate 2 plan is ready to serve as the execution basis for stress testing in this repo

## 1. Summary

The TASK-002 plan is **not ready to be used as the direct execution basis for full Gate 2 stress testing in this repo right now**. It is directionally correct, but the canonical plan artifact (`docs/agents/results/TASK-002-gemini.md`) still leaves core execution details underspecified for current repo reality: it does not cleanly separate baseline smoke testing from 100MB-class stress testing, it treats the large-asset requirement as a risk instead of a hard prerequisite, and its report template is too thin to stand as Gate 2 evidence.

The repo is ready to run **Tier 0 / Tier 1 baseline measurements** now because the viewer points at `low_poly_wood_crate.glb` and the local Draco decoder is configured. The repo is **not** ready to claim a Gate 2 stress-test execution basis because there is still no 100MB-class asset in the workspace and no authoritative execution brief that folds the review and implementation corrections back into the plan.

## 2. Files Touched or Reviewed

### Touched
- `docs/agents/results/TASK-002-validation-codex.md`

### Reviewed
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-002.md`
- `docs/agents/results/TASK-002-gemini.md`
- `docs/agents/results/TASK-002-claude.md`
- `docs/agents/reviews/TASK-002-review-cursor.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-14-task-order.md`
- `src/App.tsx`
- `src/components/ModelViewer.tsx`
- `public/test-assets/test-cube.glb`
- `public/test-assets/low_poly_wood_crate.glb`
- `public/draco/draco_decoder.js`
- `public/draco/draco_decoder.wasm`
- `public/draco/draco_wasm_wrapper.js`

## 3. Findings

### 3.1 Readiness decision

**Decision: not execution-ready for full Gate 2 stress testing.**

Reasoning:
- `docs/plan/current-status.md` and `docs/plan/phase1-checklist.md` both define Gate 2 as evidence for a **100MB-class** asset, not a smoke-test asset.
- The repo currently contains only `test-cube.glb` and `low_poly_wood_crate.glb`; neither qualifies as the required stress asset.
- No existing `docs/session/*gate2*` report artifact is present yet.

This means the plan can support baseline rehearsal, but it cannot yet serve as the direct basis for the actual Gate 2 pass/fail run.

### 3.2 Baseline smoke testing and stress testing are still not cleanly separated in the canonical plan

The reviewer correctly identified that the planner output merges smoke-test and stress-test concerns. That gap is still real in the authoritative plan file:
- `docs/agents/results/TASK-002-gemini.md` defines a large-asset goal and report template, but it does not require a distinct Tier 0 smoke pass and a separate stress tier.
- The repo now has a practical tier split in `src/App.tsx`: `test-cube.glb` for path verification and `low_poly_wood_crate.glb` for an intermediate baseline.
- `docs/agents/results/TASK-002-claude.md` documents this split clearly, but that correction was not propagated back into the planner artifact.

Result: if someone executes only from the planner file, they can still blur smoke validation, intermediate baseline, and true Gate 2 stress evidence.

### 3.3 Metrics are partly measurable, but the thresholds are not yet fully realistic for this repo

The plan's core metrics are valid:
- TTR and TTI are measurable.
- FPS during interaction is measurable.
- Stability, crashes, and GL context loss are measurable.

The weak points are:
- The pass/fail thresholds in `docs/agents/results/TASK-002-gemini.md` are absolute targets without a required baseline-first calibration step.
- Peak JS heap is measurable on desktop Chrome, but not consistently measurable on iOS Safari with the same tooling. The planner file does not state the platform-specific fallback.
- The planner template does not require recording decoder source, raw-vs-optimized asset size, or comparison against the smoke/intermediate baseline.

These omissions make the thresholds less defensible as repo-specific acceptance gates.

### 3.4 Prerequisites, blockers, and dependencies are not promoted strongly enough

For this repo, the following are prerequisites, not optional follow-up notes:
- a qualifying 100MB-class asset or equivalent optimized GLB target with a documented source
- an agreed execution environment and device/browser matrix
- a report template that records crash, stall, and GL context loss as first-class fields
- a baseline-first procedure so large-asset results can be interpreted against known viewer behavior

The planner file treats asset sourcing and Draco overhead as risks. Repo reality is stricter:
- the local Draco dependency is already resolved in `src/components/ModelViewer.tsx`
- the missing 100MB-class asset remains a hard blocker

Until those prerequisites are reflected in the authoritative plan, the plan is not fully actionable.

### 3.5 The current report structure is not sufficient on its own to become Gate 2 evidence

The planner template has the right headings, but it is too minimal for evidence quality. It does not require:
- separate baseline and stress sections
- explicit crash / stall / GL context loss fields
- asset provenance and size transformation details
- comparison columns against the baseline run
- an execution checklist that confirms local Draco, no console errors, and device/browser specifics

`docs/agents/results/TASK-002-claude.md` contains a stronger evidence-oriented structure, but that structure lives in an implementation result file rather than in the canonical execution brief.

### 3.6 Assumptions that conflict with repo reality

- `docs/agents/shared-context.md` still says the smoke-test asset is `public/test-assets/test-cube.glb`, while `docs/agents/tasks/TASK-002.md` and `src/App.tsx` reflect a broader reality where `low_poly_wood_crate.glb` is the current intermediate baseline asset.
- The planner file refers to CDN Draco decoder overhead as an open concern, but the repo now serves Draco locally via `useGLTF.setDecoderPath('/draco/')` in `src/components/ModelViewer.tsx`.

These mismatches do not invalidate the plan, but they do mean the plan is stale relative to current repo state.

## 4. Risks / Unresolved

- **Blocker:** no 100MB-class asset is available in the repo, so a real Gate 2 stress run cannot start yet.
- **High risk:** the canonical plan file still does not encode the Tier 0 / Tier 1 / stress-tier separation that the reviewer and implementer both found necessary.
- **Medium risk:** mobile memory capture remains tooling-dependent; the planner file still needs explicit iOS/Android measurement instructions.
- **Medium risk:** evidence could be rejected later because the official template is too thin, even if manual measurements are collected.
- **Low risk:** shared planning docs still contain asset-role mismatches (`test-cube.glb` vs `low_poly_wood_crate.glb`), which can confuse execution unless normalized.

## 5. Recommended Next Step

Do **not** use `docs/agents/results/TASK-002-gemini.md` by itself as the execution basis for Gate 2 stress testing. First, create or update the canonical execution brief so it incorporates the review and implementation corrections:
- make Tier 0 smoke, Tier 1 intermediate baseline, and 100MB-class stress testing explicit and separate
- promote the 100MB-class asset to a named prerequisite with acceptance criteria
- adopt the stronger evidence table structure already outlined in `docs/agents/results/TASK-002-claude.md`
- then begin baseline data capture now, while treating the actual Gate 2 stress pass as blocked until the qualifying asset exists