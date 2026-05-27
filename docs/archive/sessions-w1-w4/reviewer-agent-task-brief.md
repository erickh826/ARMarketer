# Reviewer Agent Task Brief

## Goal

Please review the proposed next-step task list for this repo against the actual current codebase and Phase 1 plan.

Your job is not to implement changes first. Your first job is to validate whether the task list matches the current repo state, identify incorrect assumptions, and recommend the right execution order.

## Proposed Task List To Review

1. Complete GLB support in ModelViewer.tsx for W3 pipeline output.
2. Run 100MB+ load and memory stress testing and produce a report for Gate 2.
3. Implement MindAR + React Three Fiber integration to replace the current A-Frame-only POC.
4. Start backend Services work for Project and MediaAsset, including upload and DB linkage.

## Important Current Repo Truth

Please do not assume all four tasks are still greenfield.

- ModelViewer currently declares support for obj, fbx, and glb, but glb loading is not actually implemented.
- The Phase 1 and pipeline docs already treat GLB as the main W3 output format.
- The current MindAR POC is still A-Frame HTML, not a React Three Fiber integration.
- ProjectService and MediaAssetService already exist in the repo.
- Upload flow example code already exists in the server example routes.
- Local upload route support was recently added.
- npm run typecheck:server currently passes.

## Files You Should Inspect First

- docs/plan/phase_plan/phase1.md
- docs/plan/pipeline-asset-flow.md
- docs/plan/validation.md
- src/components/ModelViewer.tsx
- public/poc.html
- src/types/mind-ar.d.ts
- server/services/project.service.ts
- server/services/media-asset.service.ts
- server/examples/next-app-router/app/api/assets/upload/route.ts

## Known Reality Checks

Please validate these statements instead of trusting them blindly:

1. GLB is the correct viewer target for W3 because the pipeline target is optimized GLB, likely with Draco compression.
2. Gate 2 should be based on measurable performance data, not subjective viewer impressions.
3. MindAR + R3F is an architectural integration task, not a small POC cleanup.
4. Backend Services should no longer be framed as a fresh skeleton task because core service files already exist.

## What I Need From Your Review

Please answer these questions:

1. Which parts of the proposed task list are correct?
2. Which parts are outdated or wrongly framed based on the current repo?
3. What is the correct execution order for this repo right now?
4. What dependencies or prerequisites are missing from each task?
5. Which task is highest leverage for Phase 1 and why?

## Expected Review Style

Use a code-review mindset.

- Findings first, ordered by severity.
- Focus on incorrect assumptions, execution risk, hidden dependencies, and likely regressions.
- Keep summaries short.
- If a task is already partially done, say exactly what exists and what is still missing.
- If you recommend a different order, explain the reason in terms of Phase 1 gates and current repo reality.

## Expected Output Format

Please structure the answer like this:

### Findings

- Severity + finding
- Severity + finding

### Corrected Task Framing

- Revised task 1
- Revised task 2
- Revised task 3
- Revised task 4

### Recommended Order

1. First task and why
2. Second task and why
3. Third task and why
4. Fourth task and why

### Open Risks Or Questions

- Risk or unresolved dependency
- Risk or unresolved dependency

## Strong Hint

If your review concludes that task 4 should be renamed from Start backend Services work to Harden and integrate existing backend Services, say that explicitly.