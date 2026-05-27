# TASK-002 Review — cursor (reviewer)

> Reviewed: 2026-05-14
> Reviewing: docs/agents/results/TASK-002-gemini.md
> Reviewer role: cursor

## 1. Summary

The Gemini planner output is broadly sound. It defines a test scope, device matrix, metrics, and a report template that align with the Gate 2 goal. However, the plan has three material gaps: (1) it conflates the smoke-test asset with the 100MB-class asset without distinguishing the two test tiers; (2) the pass/fail thresholds are not anchored to any existing repo baseline measurement; (3) the "large asset sourcing" is flagged only as a future implementer risk, when it is actually a prerequisite blocker that must be resolved before any execution starts.

---

## 2. Files Touched or Reviewed

- `docs/agents/tasks/TASK-002.md`
- `docs/agents/results/TASK-002-gemini.md`
- `docs/agents/shared-context.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-14-task-order.md`
- `src/components/ModelViewer.tsx`
- `src/App.tsx`

---

## 3. Findings

### 3.1 Smoke test vs. stress test tiers are merged, not separated

The plan references "at least one asset exceeding 80MB (uncompressed)" but the repo currently only has a minimal test cube at `public/test-assets/test-cube.glb`. The plan does not define a clear **Tier 0 smoke test** (current test cube, confirms load path works) separate from the **Tier 1 stress test** (100MB-class asset, produces Gate 2 evidence).

Conflating the two tiers risks the executor treating the smoke test as Gate 2 evidence. These must be explicitly labelled as separate test phases.

### 3.2 Thresholds are not anchored to any measured baseline

The TTR/TTI/FPS thresholds in Section 3.4 are presented as gates, but no prior measurement exists in the repo to justify them. For example, "TTR < 10s on mobile for a 10MB GLB" is plausible but unverified. If the first real test exceeds these thresholds, it is unclear whether the plan was wrong or the implementation is wrong.

Recommendation: the report template (Section 5) should require the executor to record a **baseline measurement on the smoke-test asset first**, then separately record measurements for the large asset. This creates an anchored comparison rather than an absolute threshold judgment.

### 3.3 Draco decoder sourcing is underspecified

`ModelViewer.tsx` uses `useGLTF(url, true)` — the second argument enables Draco. The current viewer does not configure a `DRACOLoader` path explicitly; it relies on `@react-three/drei`'s default CDN decoder. The plan mentions "CDN-based Draco decoder may introduce overhead" but does not say what to do about it. This is a concrete execution blocker: if the CDN is slow or blocked, TTR measurements will be non-reproducible. The plan should specify that all stress tests must use a locally-served Draco WASM decoder.

### 3.4 "Large asset sourcing" is listed as a risk, but it is a prerequisite

The plan correctly notes that the repo lacks a 100MB-class asset. However, it defers this to the "implementer" as a risk. This means Gate 2 cannot start without resolving it first. The plan should promote this from risk to **named prerequisite** with a defined acceptance criterion (minimum file size, format, public source or local pipeline output).

### 3.5 Memory metric tooling is underspecified for mobile

"Chrome DevTools (Memory)" works for desktop. On iOS Safari, JS heap visibility is limited. The plan does not address this gap for Tier 1/Tier 2 mobile devices, which are the highest-risk targets.

### 3.6 Report template is good but missing a context-loss / crash field

`current-status.md` explicitly lists "crash / stall / GL context loss" as a required Gate 2 observation. The report template in Section 5 does not have a dedicated field for this. It should be a first-class row, not buried in free-text Observations.

### 3.7 The `shared-context.md` states asset path as `test-cube.glb`, plan's TASK-002.md states `low_poly_wood_crate.glb`

There is a filename mismatch between `docs/agents/shared-context.md` ("test-cube.glb") and `docs/agents/tasks/TASK-002.md` ("A minimal GLB sample asset exists at `public/test-assets/low_poly_wood_crate.glb`"). The Gemini plan does not acknowledge this discrepancy. Whoever executes the test must confirm the actual filename before starting.

---

## 4. Risks / Unresolved

| # | Risk | Severity | Status |
|---|---|---|---|
| R1 | No 100MB-class asset in repo | **Blocker** | Not resolved by plan |
| R2 | Draco WASM path undefined in test environment | High | Mentioned but not resolved |
| R3 | Mobile memory measurement tooling gap | Medium | Not addressed |
| R4 | Smoke test vs. stress test tier conflation | Medium | Needs explicit separation |
| R5 | Filename mismatch: test-cube.glb vs. low_poly_wood_crate.glb | Low | Must be confirmed pre-execution |
| R6 | Thresholds not anchored to any existing measurement | Low | Addressable via baseline-first approach |

---

## 5. Recommended Next Step

1. **Resolve R1 first**: Define and commit a reproducible path to a 100MB-class test asset (pipeline output, Sketchfab download, or Blender-generated complex scene). Without this, the stress test cannot start.

2. **Separate the two test tiers explicitly** in the TASK-002 execution brief:
   - Tier 0: smoke test with existing minimal GLB (confirms code path only)
   - Tier 1: stress test with 100MB-class asset (produces Gate 2 evidence)

3. **Add GL context loss as a first-class report field** in the template.

4. **Specify local Draco decoder** in the test environment setup section to ensure reproducible TTR measurements.

5. When TASK-002 moves to `implementer` role, pass R1–R6 as explicit input constraints, not open questions.