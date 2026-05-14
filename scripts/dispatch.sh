#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: ./scripts/dispatch.sh <new-task|show-prompt|new-result|new-review> <TASK-ID> [agent] [role] [title]"
  exit 1
fi

COMMAND="$1"
TASK_ID="$2"
AGENT="${3:-codex}"
ROLE="${4:-implementer}"
TITLE="${5:-Untitled task}"
PRIORITY="${PRIORITY:-medium}"
OUTCOME="${OUTCOME:-partial}"
REVIEW_TYPE="${REVIEW_TYPE:-code-review}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENTS_DIR="$ROOT_DIR/docs/agents"
TASKS_DIR="$AGENTS_DIR/tasks"
RESULTS_DIR="$AGENTS_DIR/results"
REVIEWS_DIR="$AGENTS_DIR/reviews"

mkdir -p "$TASKS_DIR" "$RESULTS_DIR" "$REVIEWS_DIR"

TASK_PATH="$TASKS_DIR/$TASK_ID.md"
RESULT_PATH="$RESULTS_DIR/$TASK_ID-$AGENT.md"
REVIEW_PATH="$REVIEWS_DIR/$TASK_ID-review-$AGENT.md"
VALIDATION_PATH="$RESULTS_DIR/$TASK_ID-validation-$AGENT.md"

case "$COMMAND" in
  new-task)
    if [[ -f "$TASK_PATH" ]]; then
      echo "Task already exists: $TASK_PATH"
      exit 0
    fi
    cat > "$TASK_PATH" <<EOF
# $TASK_ID — $TITLE

## Metadata

- Task ID: \`$TASK_ID\`
- Role: \`$ROLE\`
- Assigned agent: \`$AGENT\`
- Status: \`todo\`
- Priority: \`$PRIORITY\`

## Objective

- <replace with one concrete objective>

## Current Repo Truth

- Read \`docs/agents/shared-context.md\` first.
- Add task-specific truths here.

## Owned Files

- <path>

## Do Not Change

- <path>

## Inputs

- <path>

## Required Output

- \`docs/agents/results/$TASK_ID-$AGENT.md\`

## Validation

- <validation>

## Notes

- Keep findings short and concrete.
EOF
    echo "Created task: $TASK_PATH"
    ;;

  new-result)
    if [[ -f "$RESULT_PATH" ]]; then
      echo "Result already exists: $RESULT_PATH"
      exit 0
    fi
    cat > "$RESULT_PATH" <<EOF
# RESULT-$TASK_ID-$AGENT

## Summary

- Task: \`$TASK_ID\`
- Agent: \`$AGENT\`
- Outcome: \`$OUTCOME\`

## What I Did

- <bullet>

## Files Touched Or Reviewed

- <path>

## Findings

- <finding>

## Risks / Unresolved

- <risk>

## Recommended Next Step

- <next step>
EOF
    echo "Created result: $RESULT_PATH"
    ;;

  new-review)
    if [[ -f "$REVIEW_PATH" ]]; then
      echo "Review already exists: $REVIEW_PATH"
      exit 0
    fi
    cat > "$REVIEW_PATH" <<EOF
# REVIEW-$TASK_ID-$AGENT

## Review Scope

- Task: \`$TASK_ID\`
- Reviewer: \`$AGENT\`
- Review type: \`$REVIEW_TYPE\`

## Findings

### High

- <finding>

### Medium

- <finding>

### Low

- <finding>

## Verified Files

- <path>

## Recommendation

- <approve|revise|block>

## Next Step

- <next step>
EOF
    echo "Created review: $REVIEW_PATH"
    ;;

  show-prompt)
    if [[ "$ROLE" == "reviewer" ]]; then
      OUTPUT_LINE="  - review:  docs/agents/reviews/$TASK_ID-review-$AGENT.md"
    elif [[ "$ROLE" == "verifier" ]]; then
      OUTPUT_LINE="  - result: docs/agents/results/$TASK_ID-validation-$AGENT.md"
    else
      OUTPUT_LINE="  - result: docs/agents/results/$TASK_ID-$AGENT.md"
    fi
    cat <<EOF
Read these files first:
- docs/agents/shared-context.md
- docs/agents/tasks/$TASK_ID.md

Your assigned role is: $ROLE
Your agent label is: $AGENT

Rules:
- Follow the task file exactly.
- Do not modify files outside your owned scope.
- Record assumptions that conflict with repo reality.
- Write your output to:
$OUTPUT_LINE

Required response structure:
1. summary
2. files touched or reviewed
3. findings
4. risks / unresolved
5. recommended next step
EOF
    ;;

  *)
    echo "Unknown command: $COMMAND"
    exit 1
    ;;
esac
