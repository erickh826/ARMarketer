# Multi-Agent Handoff Skill Brief

> Draft date: 2026-05-14
> Purpose: prepare a reusable skill for cross-agent collaboration among Codex / Cursor / Gemini / Copilot / OpenCode

## 1. Goal

Create one skill that helps different coding agents collaborate through a **shared handoff protocol**, instead of assuming they can natively call each other directly.

## 2. Important Constraint

For most environments, these agents do **not** automatically have a direct agent-to-agent call API across products.

So the skill should be designed around:

- shared task briefs
- shared result files
- explicit ownership
- structured review / handoff records

Not around unsupported direct RPC assumptions.

## 3. Recommended Skill Shape

### Suggested skill name

`multi-agent-handoff`

### Suggested trigger description

Use when Codex needs to coordinate work across multiple AI coding agents or external assistants such as Cursor, Gemini, Copilot, Codex, or OpenCode; especially for task decomposition, handoff briefs, reviewer notes, implementation ownership, merge-safe coordination, and shared artifact-based collaboration.

## 4. What the Skill Should Standardize

### A. Task brief format

Each agent should receive the same structure:

- objective
- current repo truth
- owned files
- forbidden changes
- dependencies
- validation required
- expected output format

### B. Result / handoff format

Each agent should report back with:

- what changed
- what was reviewed
- unresolved risks
- files touched
- recommended next step

### C. Coordination rules

- one owner per write area
- reviewers should not silently rewrite implementation scope
- all agents must treat existing repo state as source of truth
- if assumptions differ, record the mismatch in a shared note instead of burying it

## 5. Recommended Repo Artifact Layout

```text
docs/agents/
  inbox/
  outbox/
  reviews/
  decisions.md
  shared-context.md
```

Optional structured files:

```text
docs/agents/tasks/TASK-###.md
docs/agents/results/TASK-###-<agent>.md
docs/agents/reviews/TASK-###-review-<agent>.md
```

## 6. Suggested Role Defaults

These are defaults only; the skill should allow override.

| Agent | Default role |
| :--- | :--- |
| Codex | implementation + repo integration |
| Cursor | review, risk surfacing, task reframing |
| Gemini | planning, system reasoning, alternative design critique |
| Copilot | inline code suggestions / local completion helper |
| OpenCode | implementation or automation worker, depending on runtime |

## 7. Minimum Skill Resources

If we build this as a real skill, these bundled resources are enough for v1:

- `SKILL.md`
- `references/handoff-template.md`
- `references/review-template.md`
- `references/task-status-taxonomy.md`
- optional `assets/task-brief-template.md`

## 8. Suggested First Version Workflow

1. Read current repo status and active plan file.
2. Write or refresh shared context.
3. Split work by non-overlapping ownership.
4. Generate a short task brief per agent.
5. Require result files in a standard format.
6. Merge findings into one decision record.
7. Re-plan only after collecting returned artifacts.

## 9. Concrete Trigger Examples

Examples that should trigger the skill:

- 「幫我把這個 repo 分成 Codex / Cursor / Gemini 三個 agent 協作流程」
- 「我要寫一套 AI coding agents handoff protocol」
- 「幫我整理 reviewer、implementer、planner 三種 agent 的共用 brief」
- 「讓不同 agent 對同一 repo 用同一種任務格式工作」

## 10. Recommended Next Step

If you want, the next action should be:

1. confirm where to create the real skill folder
2. initialize `multi-agent-handoff`
3. write `SKILL.md`
4. add 2-3 reference templates
5. validate the skill
