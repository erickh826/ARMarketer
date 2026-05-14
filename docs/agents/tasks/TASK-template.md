# TASK-XXX — <title>

## Metadata

- Task ID: `TASK-XXX`
- Default role: `<implementer|planner>`
- Suggested first agent: `<codex|cursor|gemini|copilot|opencode>`
- Status: `todo`
- Priority: `<high|medium|low>`

## Objective

<one concrete objective>

## Current Repo Truth

- Read `docs/agents/shared-context.md` first.
- Add any task-specific truths here.
- This is a **main task file**.
- Review and validation should usually reuse the same `Task ID` with different roles.

## Owned Files

- `<file-or-folder>`

## Role-Based Output Convention

- `implementer` / `planner` -> `docs/agents/results/TASK-XXX-<agent>.md`
- `reviewer` -> `docs/agents/reviews/TASK-XXX-review-<agent>.md`
- `verifier` -> `docs/agents/results/TASK-XXX-validation-<agent>.md`

## Do Not Change

- `<file-or-folder>`

## Inputs

- `<relevant docs, code paths, or artifacts>`

## Required Output

- For the default role:
  - `<result file path>`
- Include:
  - `<what must be returned>`

## Validation

- `<tests, manual checks, or review criteria>`

## Notes

- Keep findings short and concrete.
- Record mismatches between assumption and repo state.
- Only create a separate review/validation task file if that work becomes a large independent task.
