# TASK-011 Plan — Hotspot Editor UI Initial Version

> Planning document for W5 milestone: Hotspot Editor UI
> Date: 2026-07-15

## Overview

We need to build a UI to allow users to place, edit, and configure "hotspots" in the 3D space of an `ARExperience`. Hotspots are interactive points (like info buttons, labels, links) overlaid on the 3D model.

## 1. Schema Changes (Prisma)

Currently, the `ARExperience` model has a `contentSceneId`, `transform`, and `animationConfig` (all `Json?`). It currently lacks a dedicated Hotspot structure. Since hotspots are strongly tied to an experience, we should define a distinct `Hotspot` model with a many-to-one relationship to `ARExperience`.

### Planned Prisma Update:
```prisma
model ARExperience {
  // ... existing fields
  hotspots Hotspot[]
}

model Hotspot {
  id              String       @id @default(cuid())
  experienceId    String
  title           String
  description     String?
  targetUrl       String?
  /// 3D position vector {x,y,z}
  position        Json
  /// Normal vector to align hotspot {x,y,z} (optional)
  normal          Json?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  experience      ARExperience @relation(fields: [experienceId], references: [id], onDelete: Cascade)

  @@index([experienceId])
}
```

## 2. API Additions

We need CRUD routes for Hotspots, likely nested under experiences.

### Planned Endpoints:
- `GET /api/experiences/:id/hotspots` - List hotspots for experience
- `POST /api/experiences/:id/hotspots` - Create hotspot
- `PATCH /api/hotspots/:id` - Update hotspot (move, edit text)
- `DELETE /api/hotspots/:id` - Remove hotspot

*Security:* Use existing `requireApiKey` middleware to ensure ownership via `ARExperience` -> `Project`.

## 3. UI Component Breakdown

The Hotspot Editor will likely be a React component wrapping existing 3D viewers.

### `HotspotEditor.tsx` (Main Container)
- Holds editor state (current experience, loaded hotspots, selected hotspot).
- Provides context for 3D interactions.

### `EditorSidebar.tsx`
- **List View:** Shows all hotspots. Allows selection, deletion, or viewing details.
- **Edit View:** Form to edit Title, Description, and Link.
- **Add Mode:** Toggles "click-to-place" behavior in the 3D canvas.

### `EditorCanvas.tsx` (extends logic from `ModelViewer.tsx`)
- Renders the `MediaAsset`.
- Iterates and renders `HotspotMarker` components at their respective `{x,y,z}` coordinates using `@react-three/drei`'s `<Html>`.
- Implements `onClick` handler via Raycaster. If "Add Mode" is active, clicking the 3D model records the intersection point (and normal) and dispatches a "hotspot placed" event.

## 4. State Management (React)

- Use a local `useReducer` or simple `useState` to track:
  - `hotspots[]` (optimistic UI updates)
  - `selectedHotspotId`
  - `editorMode`: `'view' | 'add' | 'edit'`
- When placing a hotspot, keep it in an "unsaved" local state until the user fills the form and hits Save (POST).

## Next Steps for Implementation

1. **Schema Update:** Update `prisma/schema.prisma` and run `npx prisma db push` (or migrate).
2. **Backend API:** Implement the 4 endpoints.
3. **Frontend UI:** Build the React components.

**Estimates Effort:** 4-6 hours
**Dependencies:** Requires `ARExperience` to exist (completed in TASK-009/010).