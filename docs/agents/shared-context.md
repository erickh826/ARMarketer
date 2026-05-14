# Shared Context

> Last updated: 2026-05-14
> This file is the shared source of truth for external CLI agents working on this repo.

## Repo

- Name: `ARMarketer`
- Goal: build a Web AR/VR/3D marketing platform to replace Zapworks-dependent delivery

## Current Stage

- Phase: `Phase 1`
- Status: `W2 complete / W3 in progress`

## Current Truths

1. MindAR feasibility POC exists in `public/poc.html`, but formal Gate 1 evidence is still missing.
2. Viewer skeleton exists in `src/components/ModelViewer.tsx`.
3. GLB is the intended W3 pipeline output format, but the viewer does not fully support GLB yet.
4. Prisma schema and backend services already exist; backend work should be framed as hardening/integration, not greenfield skeleton work.
5. Upload routes exist as example code under `server/examples/next-app-router/`, but they are not yet integrated into the main app runtime.

## Primary Planning Files

- `system_plan.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-14-task-order.md`

## Current Recommended Priority

1. add real GLB support to the viewer
2. produce Gate 2 measurement evidence
3. harden and integrate existing backend services
4. define upload -> pipeline -> derived asset lifecycle
5. then start MindAR + React/R3F architecture work

## Collaboration Rules

- One owner per write scope.
- Do not silently expand scope.
- If repo truth conflicts with assumptions, record the mismatch in the task result.
- Always list files touched or reviewed.
- Prefer short artifact files over long chat-only reasoning.
