# TASK-003 — Execute Gate 2 mobile validation and record evidence

## Metadata

- Task ID: `TASK-003`
- Default role: `implementer`
- Suggested first agent: `codex`
- Status: `todo`
- Priority: `high`

## Objective

Run the missing mobile-device validation for Gate 2 using the current large GLB asset, record measurable evidence, and determine whether Gate 2 can move from `desktop-passed-mobile-pending` to full pass or fail.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- `docs/session/2026-05-14-gate2-report.md` already records a desktop pass and explicitly says mobile validation is still pending.
- `docs/plan/phase1-checklist.md` currently marks Gate 2 as `desktop-passed-mobile-pending`.
- A real large GLB asset exists at `public/test-assets/cyberpunk_city.glb`.
- Actual file size check shows:
  - `public/test-assets/cyberpunk_city.glb` = 142,987,188 bytes (~136.36 MB)
  - `public/test-assets/low_poly_wood_crate.glb` = 1,695,752 bytes (~1.62 MB)
- This conflicts with `docs/session/2026-05-14-gate2-report.md`, which currently names `low_poly_wood_crate.glb` as a 138 MB asset. The executor must record and correct this mismatch in the task result.
- `src/components/ModelViewer.tsx` is already configured to use a local Draco decoder via `/draco/`.
- This is a **main task**. Review and validation should reuse `Task ID = TASK-003` with different roles.

## Owned Files

- `docs/agents/results/TASK-003-codex.md`
- `docs/session/2026-05-14-gate2-mobile-report.md`

## Role-Based Output Convention

- `implementer` / `planner` -> `docs/agents/results/TASK-003-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-003-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-003-validation-<agent>.md`

## Do Not Change

- `server/**`
- `prisma/**`
- `pipeline/**`
- `src/**` unless a tiny path swap in `src/App.tsx` is strictly required to point at `cyberpunk_city.glb` for manual testing

## Inputs

- `docs/agents/shared-context.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/session/2026-05-14-task-order.md`
- `docs/session/2026-05-14-gate2-report.md`
- `docs/agents/results/TASK-002-gemini.md`
- `docs/agents/reviews/TASK-002-review-cursor.md`
- `docs/agents/results/TASK-002-claude.md`
- `docs/agents/results/TASK-002-validation-codex.md`
- `src/App.tsx`
- `src/components/ModelViewer.tsx`
- `public/test-assets/cyberpunk_city.glb`

## Required Output

- For the default role:
  - `docs/agents/results/TASK-003-codex.md`
- Also produce or update:
  - `docs/session/2026-05-14-gate2-mobile-report.md`
- Include:
  - tested mobile device model
  - OS version
  - browser name and version
  - tested asset filename and actual size
  - load time
  - interaction quality
  - console errors
  - context loss, tab kill, or crash result
  - memory observation if tooling is available
  - explicit pass / fail / pass-with-warnings decision
  - any repo-truth mismatch discovered during execution

## Validation

- Use `public/test-assets/cyberpunk_city.glb` as the default Gate 2 mobile stress asset unless a different asset is explicitly justified.
- Separate the mobile stress run from desktop evidence already captured.
- At minimum, execute on one target mobile browser.
- Preferred matrix:
  - iPhone 12/13 or newer on Safari
  - Android 12+ device on Chrome
- Record these first-class observations:
  - load start to ready time
  - first meaningful interaction / orbit responsiveness
  - smooth / degraded / unusable interaction outcome
  - console errors, if any
  - WebGL context loss, tab reload, or OS tab kill
- For Android Chrome, use remote debugging if available to capture memory or console details.
- For iOS Safari, if JS heap is not available, record Safari Web Inspector observations or treat tab kill / reload as the failure proxy.
- Gate 2 can only move to full pass if the mobile run completes without crash or context loss and remains usable after load.

## Notes

- Keep the result short and evidence-oriented.
- Do not restate desktop results except where needed for comparison.
- If mobile validation cannot be completed because the device or tooling is unavailable, record the exact blocker and do not overstate readiness.
- If `src/App.tsx` is temporarily pointed at `cyberpunk_city.glb` for manual testing, record that change in the result and keep scope minimal.
