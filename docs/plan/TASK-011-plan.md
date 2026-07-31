# TASK-011 Plan — Hotspot Baseline Close-Out

> Revised close-out plan for the existing W5 hotspot baseline
> Last updated: 2026-07-31

## Overview

The original TASK-011 planning document assumed hotspot schema, API, and editor UI did not yet exist. That is no longer true. The repo already contains:

- Prisma `Hotspot` model and `ARExperience.hotspots` relation
- Example API routes for list/create/update/delete hotspot operations
- Express-host mounting for those routes
- A React hotspot editor scaffold enabled through `?editor=true`

The remaining problem is documentation and validation lag: repo reality advanced further than the task artifacts. This plan redefines TASK-011 as a close-out task for the existing hotspot baseline.

## 1. What Already Exists

### Schema

Present in `prisma/schema.prisma`:

- `ARExperience.hotspots`
- `Hotspot` model with:
  - `experienceId`
  - `title`
  - `description`
  - `targetUrl`
  - `position`
  - `normal`

### API

Present in server example app:

- `GET /api/experiences/:id/hotspots`
- `POST /api/experiences/:id/hotspots`
- `PATCH /api/hotspots/:id`
- `DELETE /api/hotspots/:id`

Mounted by `server/examples/express-host/index.js`.

### UI

Present in React app:

- `src/components/HotspotEditor.tsx`
- `src/components/EditorCanvas.tsx`
- `src/components/EditorSidebar.tsx`
- `src/App.tsx` entry via `?editor=true&experienceId=...&assetUrl=...&assetType=glb`

## 2. Remaining Gaps

The hotspot baseline should currently be treated as **partial**, not absent and not fully closed. The main remaining gaps are:

1. **Runtime verification evidence is missing or scattered**
   - We need one clean artifact showing the editor/API flow works end-to-end.

2. **Local DB sync may block testing**
   - If a local developer DB predates the `Hotspot` model, hotspot routes will fail until `npx prisma db push` is run.

3. **Task artifacts still describe old reality**
   - Older task/plan docs talk about hotspot schema/API as future work.

4. **Potential UX polish gaps**
   - Editor is functional as a baseline, but may still need lightweight polish or edge-case cleanup before it can be marked fully done in the checklist.

## 3. Required Verification Scope

TASK-011 close-out should verify the following:

1. **Read**
   - Load existing hotspots for an experience through `GET /api/experiences/:id/hotspots`

2. **Create**
   - Add a hotspot via editor mode or direct API call
   - Confirm persisted title + position

3. **Update**
   - Edit hotspot title/description/targetUrl
   - Confirm `PATCH /api/hotspots/:id` returns updated record

4. **Delete**
   - Remove hotspot and confirm it no longer appears in list

5. **Local prerequisite**
   - Confirm whether local DB required `npx prisma db push`

## 4. Recommended Close-Out Artifact

The implementer result should explicitly capture:

- test environment
  - backend host
  - DB readiness
  - whether `db push` was required
- editor entry URL used
- hotspot CRUD evidence
- known remaining UX/runtime limitations
- verdict:
  - keep `partial`, or
  - promote to `done`

## 5. Status Recommendation

Until runtime evidence is captured cleanly, the repo should use this wording:

- `Hotspot data model + API`: `Complete`
- `Hotspot editor UI initial version`: `Partial`

That wording matches the current codebase more accurately than either of these extremes:

- "Not started"
- "Fully complete"

## 6. Known Follow-Up Hardening (Not a TASK-011 Blocker)

The hotspot baseline can be closed without solving every multi-editor concurrency risk. Those risks are real, but they belong to a separate hardening workstream rather than the baseline proof itself.

### Lost Update / Optimistic Concurrency

Current editor save flow is vulnerable to classic CMS-style last-write-wins behavior if two users edit the same hotspot at the same time. The close-out artifact for TASK-011 should explicitly record this as a known limitation if runtime verification passes.

Recommended hardening direction:

- add optimistic concurrency protection for hotspot and experience updates
- prefer a dedicated `version` field or `updatedAt` compare-and-swap semantics
- return `409 Conflict` on stale writes so the editor can reload and retry

This should be handled as a separate task because it requires changes across:

- `prisma/schema.prisma`
- hotspot / experience update routes
- service-layer update semantics
- editor save contract

### Suggested Non-Blocking Note for TASK-011 Result

If the hotspot editor works at runtime, the result should say:

- baseline UX/API works
- multi-editor lost-update protection is **not yet hardened**
- follow-up tracked under a separate concurrency task

## 7. Next Steps

1. Run local prerequisite if needed:
   - `npx prisma db push`
2. Start backend:
   - `npm run dev:example-host`
3. Start frontend:
   - `npm run dev`
4. Open editor mode with a real `experienceId` and asset URL
5. Record hotspot CRUD evidence in `docs/agents/results/TASK-011-implementer.md`

## 8. Notes

- Do not reopen speculative schema design unless repo code is rolled back.
- Treat this as a close-out and evidence task, not a blank-slate planning task.
