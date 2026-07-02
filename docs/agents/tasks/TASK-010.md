# TASK-010 — Team Guide HTML + TASK-009 Verification

## Metadata

- Task ID: `TASK-010`
- Default role: `implementer`
- Suggested first agent: `copilot`
- Status: `todo`
- Priority: `high`

## Objective

Create an internal HTML team guide page for Phase-1 workflow and verify TASK-009 API behavior end-to-end. This task provides an onboarding artifact and ensures Task-009 outputs are technically validated.

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- TASK-009 routes exist in server example app and currently pass `npm run typecheck:server`.
- Team guide currently may be missing or outdated.
- This is a **main task file**. Review and validation should reuse `Task ID = TASK-010` with different roles.

## Owned Files

- `public/team-guide.html` ← **create or update**
- `docs/agents/reviews/TASK-010-review-<agent>.md` ← **create**
- `docs/agents/results/TASK-010-validation-<agent>.md` ← **create**
- `docs/plan/current-status.md` ← **update if needed**
- `docs/plan/phase1-checklist.md` ← **update if needed**

## Do Not Change

- `server/services/**`
- `prisma/**`
- `src/**`
- `pipeline/**`

## Inputs

- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-009.md`
- `docs/plan/TASK-009-plan.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `server/examples/next-app-router/app/api/experiences/route.ts`
- `server/examples/next-app-router/app/api/experiences/[id]/route.ts`
- `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts`
- `server/examples/express-host/index.js`

## Deliverables

### 1) Team Guide HTML

Create/update `public/team-guide.html` with:

- Project overview (ARMarketer Phase-1 scope)
- Environment setup checklist
- API workflow section for TASK-009 (create experience, bind, unbind, delete)
- Debug and troubleshooting section
- Simple command snippets for local verification

### 2) TASK-009 Verification Evidence

Produce a verification report that includes:

- `npm run typecheck:server` output summary
- Route-level verification checklist for all 7 endpoints from TASK-009
- Auth behavior notes (`x-api-key` required)
- Validation behavior notes (`422` for mismatch constraints)

## Acceptance Criteria

1. `public/team-guide.html` is present and readable in browser.
2. Team guide contains setup, API workflow, and troubleshooting sections.
3. `npm run typecheck:server` passes.
4. Validation report explicitly covers:
   - `POST /api/experiences`
   - `GET /api/experiences?projectId=`
   - `GET /api/experiences/:id`
   - `PATCH /api/experiences/:id`
   - `DELETE /api/experiences/:id`
   - `POST /api/targets/:id/bind/:experienceId`
   - `DELETE /api/targets/:id/bind`
5. Review report includes recommendation: `approve` / `revise` / `block`.

## Validation Commands

- `npm run typecheck:server`
- Optional smoke test through example host on `localhost:3001`

## Notes

- Keep content practical and concise for team onboarding.
- Do not introduce schema/service changes.
- If live API smoke test cannot be completed, document blocker and keep evidence explicit.
