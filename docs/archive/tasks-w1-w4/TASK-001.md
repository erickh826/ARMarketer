# TASK-001 — Add GLB support to ModelViewer

## Metadata

- Task ID: `TASK-001`
- Role: `implementer`
- Assigned agent: `codex`
- Status: `completed`
- Priority: `high`

## Objective

- Add actual GLB loading support to `src/components/ModelViewer.tsx` so the viewer can consume W3 pipeline output.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- `ModelViewer.tsx` supports OBJ, FBX, and GLB loading.
- A minimal GLB smoke-test asset exists at `public/test-assets/test-cube.glb`.
- `src/App.tsx` is currently pointed at the GLB smoke-test path.
- Runtime browser smoke testing is still pending because of the current local `dist/` EPERM blocker.

## Owned Files

- `src/components/ModelViewer.tsx`
- optional: `src/App.tsx`

## Do Not Change

- `prisma/**`
- `server/**`
- `pipeline/**`

## Inputs

- `src/components/ModelViewer.tsx`
- `src/App.tsx`
- `docs/session/2026-05-14-task-order.md`

## Required Output

- `docs/agents/results/TASK-001-codex.md`
- include files touched, loader choice, and any cleanup implications

## Validation

- keep existing OBJ/FBX behavior intact
- preserve current loading UI
- note whether a GLB sample path was added or still needs an asset

## Notes

- Keep scope tight.
- Follow-up work is tracked in `docs/agents/tasks/TASK-001A.md`.
