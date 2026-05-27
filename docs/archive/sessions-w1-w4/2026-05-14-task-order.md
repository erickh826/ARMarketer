# Recommended Task Order — 2026-05-14

## Executive Summary

Current repo priority should follow the Phase 1 critical path:

1. make W3 output loadable in the viewer
2. produce measurable Gate 2 evidence
3. harden and integrate the existing backend/upload skeleton
4. define upload -> pipeline -> derived asset state transition
5. then move into MindAR React integration

---

## Recommended Order

### 1. Complete GLB support in `ModelViewer.tsx`

**Why first**

- W3 pipeline docs already define GLB as the target output.
- Current viewer cannot consume the planned output format.
- Without this, pipeline validation remains disconnected from the front end.

**Definition of done**

- Add real GLB loading branch
- Confirm cleanup/dispose behavior still works
- Add one small GLB sample or documented loading target

**Dependencies**

- none beyond current viewer code

---

### 2. Run Gate 2 stress testing and write the result record

**Why second**

- Gate 2 should be based on evidence, not impressions.
- The repo already has enough viewer skeleton to start collecting timing/memory notes.
- This determines whether current viewer architecture is viable before expanding scope.

**Definition of done**

- Define test device(s) and browser(s)
- Test at least one large asset case
- Record:
  - load start
  - first visible frame / first meaningful interaction
  - memory/stability observations
  - crash / stall / degraded behavior
- Save report under `docs/session/`

**Dependencies**

- task 1 should land first if Gate 2 is meant to cover W3 target format as well

---

### 3. Reframe backend work as “harden and integrate existing services”

**Why third**

- `ProjectService`, `MediaAssetService`, `ImageTargetService`, and `ARExperienceService` already exist.
- Upload authorization route and local upload route already exist as examples.
- This is no longer a “start backend skeleton” task.

**Definition of done**

- Convert example-level assumptions into an integration checklist
- Decide real host boundary: Next app, Express app, or other server wrapper
- Preserve current service layer rather than rewriting from scratch

**Dependencies**

- none, but clearer after viewer target format is settled

---

### 4. Add upload lifecycle integrity and pipeline state transitions

**Why fourth**

- Current upload path creates placeholder records before actual bytes are verified.
- `MediaAsset` status flow is documented but not fully enforced.
- This is the minimum needed before a real W3/W4 end-to-end content chain is trustworthy.

**Definition of done**

- Define uploaded vs verified/finalized state contract
- Add finalize/verification step or equivalent workflow
- Define how pipeline writes `processingJobId`, `READY`, `FAILED`, and derived asset linkage

**Dependencies**

- task 3, because this belongs in the real backend integration path

---

### 5. Start MindAR + React Three Fiber integration as a separate architecture task

**Why fifth**

- This is still important, but it is not a small cleanup.
- W1 feasibility already has a POC; the immediate repo gap is end-to-end asset flow.
- Doing this too early risks splitting focus before W3/W4 flow is anchored.

**Definition of done**

- Create an architecture spike, not a production promise
- Decide scene ownership between MindAR and R3F
- Document asset placement, anchor handling, and cleanup responsibilities

**Dependencies**

- none technically, but best started after task 1-4 reduce uncertainty elsewhere

---

## Highest-Leverage Task Right Now

**Task 1: GLB support in `ModelViewer.tsx`**

Because Phase 1 docs already assume optimized GLB is the output contract. Right now the repo has a mismatch:

- pipeline direction says “GLB”
- viewer reality says “OBJ / FBX only”

Closing that mismatch unlocks both testing and later integration.

---

## Anti-Pattern To Avoid

Do **not** describe the next backend step as:

- “start backend services”
- “create backend skeleton”

That framing is now outdated and risks duplicate work.

Use this wording instead:

- **Harden and integrate existing backend services**

---

## Suggested Immediate Deliverables

If executing this order now, the next 3 concrete artifacts should be:

1. `ModelViewer.tsx` with real GLB path
2. `docs/session/<date>-gate2-report.md`
3. `docs/session/<date>-backend-integration-checklist.md`
