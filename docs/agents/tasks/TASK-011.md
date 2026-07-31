# TASK-011 — Hotspot Editor UI Initial Version

## Metadata

- Task ID: `TASK-011`
- Default role: `implementer`
- Suggested first agent: `codex`
- Status: `in-progress`
- Priority: `medium`

## Objective

Close out the initial Hotspot Editor baseline so repo documentation matches implementation reality. The hotspot schema, API routes, and React editor scaffold already exist; the remaining work is to verify runtime behavior, capture evidence, and tighten any missing UX/runtime gaps needed for a credible Phase 1 baseline.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- `ARExperience` entity and endpoints are already completed.
- Prisma already defines `Hotspot` and `ARExperience.hotspots`.
- Example host already mounts:
  - `GET /api/experiences/:id/hotspots`
  - `POST /api/experiences/:id/hotspots`
  - `PATCH /api/hotspots/:id`
  - `DELETE /api/hotspots/:id`
- React editor files already exist:
  - `src/components/HotspotEditor.tsx`
  - `src/components/EditorCanvas.tsx`
  - `src/components/EditorSidebar.tsx`
  - `src/App.tsx` supports `?editor=true`
- The main gap is no clean close-out artifact proving the hotspot baseline works end-to-end in the current repo state.

## Owned Files

- `docs/plan/TASK-011-plan.md`
- `docs/agents/results/TASK-011-implementer.md`
- `docs/agents/reviews/TASK-011-review.md`

## Role-Based Output Convention

- `implementer` -> `docs/agents/results/TASK-011-implementer.md`
- `reviewer` -> `docs/agents/reviews/TASK-011-review.md`

## Do Not Change

- Core existing backend paths or MindAR integration files (unless adding API integrations).

## Inputs

- `docs/plan/W5-W6-roadmap.md`
- `prisma/schema.prisma`
- `server/examples/next-app-router/app/api/experiences/[id]/hotspots/route.ts`
- `server/examples/next-app-router/app/api/hotspots/[id]/route.ts`
- Existing UI components:
  - `src/components/HotspotEditor.tsx`
  - `src/components/EditorCanvas.tsx`
  - `src/components/EditorSidebar.tsx`
  - `src/App.tsx`

## Required Output

For the default role (`implementer`):
- `docs/agents/results/TASK-011-implementer.md`

Include:
- runtime verification scope for hotspot baseline
- what already exists vs. what still needs cleanup
- whether local DB sync (`npx prisma db push`) is required before testing
- any remaining UX/runtime gaps that keep the editor at `partial` instead of `done`

`docs/plan/TASK-011-plan.md` should reflect the revised close-out plan rather than the original speculative schema/API design.

## Validation

- Reviewer should confirm the task/plan now match repo reality and do not describe hotspot schema/API as future work.
- Runtime validation should cover:
  - loading hotspots for an experience
  - creating a hotspot via editor/API
  - editing a hotspot
  - deleting a hotspot
  - behavior when local DB schema is not yet synced

## Notes

- Keep findings short and concrete.
- Do not rewrite history by pretending the hotspot baseline never landed.
- The current priority is evidence + cleanup, not speculative redesign.
