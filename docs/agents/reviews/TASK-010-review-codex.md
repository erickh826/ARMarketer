## 1. summary

Recommendation: `revise`

The original 5 review findings have been addressed: the validation artifact now includes the 7-endpoint checklist, the Gate 4 wording was updated away from the old Zapworks-card framing, the API key note is now conditional, the unsupported `duplicate name` `422` example is gone, and troubleshooting now points to `prisma db push` instead of migrations.  

One new repo-truth mismatch remains: `public/team-guide.html` now claims `TASK-011` is complete and that W5 is fully complete, but the authoritative status files still say `W5 in progress` and `Hotspot editor UI` is not started. Because this page is intended as an onboarding reference, that mismatch should be corrected before approval.

## 2. files touched or reviewed

Touched:
- `docs/agents/reviews/TASK-010-review-codex.md`

Reviewed:
- `docs/agents/shared-context.md`
- `docs/agents/tasks/TASK-010.md`
- `docs/agents/results/TASK-010-validation-agent.md`
- `public/team-guide.html`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/agents/tasks/TASK-011.md`
- `server/examples/next-app-router/app/api/experiences/route.ts`
- `server/examples/next-app-router/app/api/experiences/[id]/route.ts`
- `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts`
- `server/examples/express-host/index.js`
- `server/services/ar-experience.service.ts`
- `server/services/image-target.service.ts`

## 3. findings

1. Medium — `public/team-guide.html` overstates current project completion status.  
   The guide says W5 is complete and lists `TASK-011 Hotspot Editor UI` as done, plus "P0 concurrency hardening", but the repo's authoritative status files still say `W5 in progress` and `Hotspot editor UI` is `Not started`. `TASK-011` also still exists as a task/planning artifact, not a completed implementation artifact in the reviewed scope. For a team onboarding page, this is a meaningful planning mismatch.  
   Refs: `public/team-guide.html` section 4 and section 10, `docs/agents/shared-context.md` current stage/recommended priority, `docs/plan/current-status.md` stage + "Hotspot editor UI | Not started", `docs/plan/phase1-checklist.md` W5 checklist, `docs/agents/tasks/TASK-011.md`

## 4. risks / unresolved

- Assumption conflict: `docs/agents/shared-context.md` still says the reviewer agent label is `gemini`, but this review was explicitly assigned to `codex`. I followed the explicit assignment.
- I did not re-run live API smoke tests in this pass. The validation artifact now meets the required documentation shape, but runtime evidence remains whatever was previously recorded by the implementer/verifier.
- If the repo owners intentionally advanced W5/TASK-011 outside the checked status docs, then the real problem is stale authoritative status files rather than the team guide. As of this review, the guide and the status docs still conflict.

## 5. recommended next step

Resolve the status mismatch one way or the other, then re-submit TASK-010:

1. If `TASK-011` is not actually complete, change `public/team-guide.html` back to match the current authoritative status docs.
2. If `TASK-011` and W5 completion are real, update `docs/agents/shared-context.md`, `docs/plan/current-status.md`, and `docs/plan/phase1-checklist.md` so the team guide is no longer ahead of repo truth.
