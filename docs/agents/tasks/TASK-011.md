# TASK-011 — Hotspot Editor UI Initial Version

## Metadata

- Task ID: `TASK-011`
- Default role: `planner`
- Suggested first agent: `copilot`
- Status: `todo`
- Priority: `medium`

## Objective

Design and plan the initial version of the Hotspot Editor UI. This UI will allow users to view, create, edit, and position hotspots for an `ARExperience`.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- The `ARExperience` entity and endpoints have already been completed in TASK-009/TASK-010.
- Hotspot data structure should exist on `ARExperience` (or as a separate related entity). We need to review the `prisma.schema` to ensure the structure exists, or plan the schema update if it doesn't.
- This is a UI planning task. Implementation will follow in subsequent tasks depending on the size of the plan.

## Owned Files

- `docs/plan/TASK-011-plan.md` (to be created)

## Role-Based Output Convention

- `planner` -> `docs/plan/TASK-011-plan.md`
- `implementer` -> `docs/agents/results/TASK-011-implementer.md`
- `reviewer` -> `docs/agents/reviews/TASK-011-review.md`

## Do Not Change

- Core existing backend paths or MindAR integration files (unless adding API integrations).

## Inputs

- `docs/plan/W5-W6-roadmap.md`
- `prisma/schema.prisma`
- Existing UI components, specifically `ModelViewer.tsx` (as it might be reused or extended for the editor).

## Required Output

- For the default role (`planner`):
  - `docs/plan/TASK-011-plan.md`
- Include:
  - Required schema changes (if any) for Hotspots.
  - Required API additions (if any) to support Hotspot UI.
  - Component breakdown for the Editor UI (e.g., Sidebar list, 3D Canvas with click-to-place, Property panel).
  - State management considerations for editing before saving.

## Validation

- Review by another agent/human to ensure the plan covers all necessary aspects to implement a functional hotspot editor.

## Notes

- Keep findings short and concrete.
- Check how hotspots will be represented visually in the 3D space during editing vs. viewing.
- The current priority is planning the UI surface.