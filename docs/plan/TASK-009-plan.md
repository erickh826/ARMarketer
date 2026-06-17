# TASK-009 Plan — Target-Experience Binding Workflow

> Planning document for the next W5 priority after TASK-008 completion
> Date: 2026-06-12

## Overview

After TASK-008 (ImageTarget API routes) is complete, the next priority is to wire the target-experience binding relationship. This allows:

1. Creating/updating an `ARExperience` with an `imageTargetId` (many-to-one: many experiences can reference a target)
2. Setting/unsetting the special `boundExperienceId` on an `ImageTarget` (one-to-one: one experience can be the "official" bound experience)

## Schema Relationships (Current State)

```prisma
model ImageTarget {
  …
  boundExperienceId  String?  @unique       // The ONE experience bound to this target
  boundExperience    ARExperience? @relation("BoundExperience", fields: [boundExperienceId], references: [id])
  experiences        ARExperience[] @relation("TargetExperiences")  // All experiences that mention this target
  …
}

model ARExperience {
  …
  imageTargetId     String?                // Can reference a target (many-to-one)
  imageTarget       ImageTarget? @relation("TargetExperiences", fields: [imageTargetId], references: [id])
  boundByTarget     ImageTarget? @relation("BoundExperience")     // Is this experience the one bound?
  …
}
```

This means:
- An experience can have an `imageTargetId` (is tracked by a target, part of many-to-one)
- An experience can be the `boundExperience` of a target (is specially bound, part of one-to-one)
- A target can have one and only one `boundExperienceId`
- If you unbind a target, its `boundExperienceId` becomes null

## What TASK-009 Must Do

### 1. ARExperience CRUD Routes (extend existing or create new)

The `ARExperienceService` already exists. We need API routes to:

- **POST /api/experiences** — create an experience (optionally with `imageTargetId`)
  - Body: `{ projectId, name, imageTargetId?, mediaAssetId?, contentType, … }`
  - Validation: both `imageTargetId` and `mediaAssetId` must belong to same project (service handles this)
  - Auth: require `x-api-key` for the project

- **GET /api/experiences?projectId=** — list all experiences for a project
  - Auth: require `x-api-key`

- **GET /api/experiences/:id** — get single experience with relations
  - Returns with `imageTarget` and `mediaAsset` includes
  - Auth: require `x-api-key` for owning project

- **PATCH /api/experiences/:id** — update experience (including `imageTargetId`)
  - Body: `{ name?, imageTargetId?, mediaAssetId?, contentSceneId?, transform?, animationConfig?, audioUrl? }`
  - Validation: same-project constraint
  - Auth: require `x-api-key`

- **DELETE /api/experiences/:id** — delete experience
  - If this experience was `boundByTarget`, the target's `boundExperienceId` is set to null
  - Auth: require `x-api-key`

### 2. Target-Binding Endpoint (new)

A dedicated binding operation to set/unset the `boundExperienceId`:

- **POST /api/targets/:targetId/bind/:experienceId** — bind an experience to a target
  - Validation: both in same project, `imageTargetId` on experience should already be targetId
  - Returns: target with updated `boundExperienceId`
  - Auth: require `x-api-key`
  - Effect: sets `ImageTarget.boundExperienceId = experienceId`

- **DELETE /api/targets/:targetId/bind** — unbind the currently bound experience from a target
  - Returns: target with `boundExperienceId` set to null
  - Auth: require `x-api-key`
  - Effect: sets `ImageTarget.boundExperienceId = null`

Alternatively, you could PUT/PATCH the experience itself:
- **PATCH /api/experiences/:id** with `{ imageTargetId: "xyz" }` — if the experience should become the bound one, you'd also call `/api/targets/xyz/bind/:id`
- Or add a `bindToTarget` flag in the PATCH body

The dedicated endpoint approach is cleaner for the semantic operation.

### 3. ARExperienceService Extension (if needed)

The service already has `create()`, `update()`, etc. Check if we need:

- A method to validate same-project for `imageTargetId` (already in `create()`)
- A method to bind/unbind (may not be needed if we just update `boundExperienceId` directly via Prisma)

Likely: **no service changes needed**. The `ARExperienceService` already validates.

## Files to Create/Modify

| File | Action | Scope |
|---|---|---|
| `server/examples/next-app-router/app/api/experiences/route.ts` | Create | POST (create), GET (list by projectId) |
| `server/examples/next-app-router/app/api/experiences/[id]/route.ts` | Create | GET, PATCH, DELETE single experience |
| `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts` | Create | POST (bind), DELETE (unbind) |
| `server/examples/express-host/index.js` | Modify | Import new handlers, mount 5 new routes |
| `docs/plan/phase1-checklist.md` | Modify | Mark completed when verified |

## Acceptance Criteria for TASK-009

1. `npm run typecheck:server` passes with zero errors.
2. `POST /api/experiences` creates an experience with optional `imageTargetId` and returns `201`.
3. `GET /api/experiences?projectId=001` returns array of experiences.
4. `GET /api/experiences/:id` returns single experience with `imageTarget` and `mediaAsset` includes.
5. `PATCH /api/experiences/:id` updates allowed fields (including `imageTargetId`) and returns `200`.
6. `DELETE /api/experiences/:id` deletes and returns `204`.
7. `POST /api/targets/:targetId/bind/:experienceId` sets `boundExperienceId` and returns `200` with updated target.
8. `DELETE /api/targets/:targetId/bind` unsets `boundExperienceId` and returns `204`.
9. All write routes return `401`/`403` without valid `x-api-key`.
10. Binding validates that target and experience are in the same project (returns `422` if mismatch).

## Smoke Test Plan

```
# Create an experience with imageTargetId
POST /api/experiences
  projectId=001, name="Test Experience", imageTargetId=<SOME_TARGET_ID>
  x-api-key: test-key-001
  → 201, experience with imageTargetId set

# List experiences for the project
GET /api/experiences?projectId=001
  x-api-key: test-key-001
  → 200, array with the new experience

# Get single experience
GET /api/experiences/<EXPERIENCE_ID>
  x-api-key: test-key-001
  → 200, full experience with imageTarget nested

# Update the experience
PATCH /api/experiences/<EXPERIENCE_ID>
  name="Updated Name"
  x-api-key: test-key-001
  → 200, updated experience

# Bind the experience to the target
POST /api/targets/<TARGET_ID>/bind/<EXPERIENCE_ID>
  x-api-key: test-key-001
  → 200, target with boundExperienceId set

# Unbind
DELETE /api/targets/<TARGET_ID>/bind
  x-api-key: test-key-001
  → 204

# Delete the experience
DELETE /api/experiences/<EXPERIENCE_ID>
  x-api-key: test-key-001
  → 204
```

## Relation to Future W5/W6 Work

- **After TASK-009:** W5 milestone includes hotspot editor UI (initial version) — can reuse the experience API as its backend
- **W6 priority:** MindAR + React/R3F integration will consume experiences from `GET /api/experiences/:id` and drive the viewer with the `imageTargetId` + `mediaAssetId` payload

## Architecture Notes

- **No schema changes needed** — schema already has the relationships.
- **Service layer is ready** — `ARExperienceService` validates same-project constraints in `create()`.
- **Auth pattern:** reuse `requireApiKey` middleware from TASK-008 (file: `lib/api-key-auth.ts`).
- **Route mounting:** follow the same Express host pattern as TASK-008 (import handlers, mount with express.json() middleware).
- **Error handling:** return `422` for same-project validation failures, `404` for missing resources, `401`/`403` for auth.

## Next Steps

1. Create TASK-009 task file (reference this plan)
2. Assign to implementer agent
3. Review and verify against this acceptance criteria
4. Update phase1-checklist.md upon completion

---

**Owner:** Assigned upon task creation  
**Estimated effort:** 2–3 hours (similar scope to TASK-008)  
**Risk:** Low (service layer is proven, follows TASK-008 pattern)
