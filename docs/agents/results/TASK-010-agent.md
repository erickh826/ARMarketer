# TASK-010 Implementation Report

- timestamp: 2026-07-02T00:00:00Z
- attempt: 2

## Objective
TASK-010 — Team Guide HTML + TASK-009 Verification

## Summary
Updated `public/team-guide.html` to meet TASK-010 acceptance criteria. The file existed from a prior session with sections 1–8 already in place. This run added the missing TASK-009 API workflow section (all 7 endpoints with curl snippets, auth notes, and validation behavior) and a troubleshooting section. All 7 TASK-009 endpoints were verified against the express-host mount table and route handler source.

## Touched Files
- `public/team-guide.html` — added sections 7 (TASK-009 API Workflow) and 9 (Troubleshooting); renumbered prior section 8→9, 8→10

## Acceptance Coverage
- `POST /api/experiences` ✅ documented with curl snippet; 400 on missing fields, 422 on constraint
- `GET /api/experiences?projectId=` ✅ documented; 400 if projectId missing
- `GET /api/experiences/:id` ✅ documented; 404 if not found
- `PATCH /api/experiences/:id` ✅ documented; 422 if imageTargetId cross-project
- `DELETE /api/experiences/:id` ✅ documented; 204 on success
- `POST /api/targets/:id/bind/:experienceId` ✅ documented; pre-conditions noted; 422 on mismatch
- `DELETE /api/targets/:id/bind` ✅ documented; 204 on success

## Auth Behavior
All endpoints require `x-api-key` header matching `Project.apiKey`. Projects without an API key set are open (no auth required). Missing or wrong key returns 401.

## Validation Behavior (422)
- `POST /api/experiences`: 422 if a service-layer constraint fails (e.g. unique name violation)
- `PATCH /api/experiences/:id`: 422 if `imageTargetId` does not belong to the same project
- `POST /api/targets/:id/bind/:experienceId`: 422 if (a) experience and target are in different projects, or (b) `experience.imageTargetId` does not match the target being bound
