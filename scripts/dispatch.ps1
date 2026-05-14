param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('new-task', 'show-prompt', 'new-result', 'new-review')]
  [string]$Command,

  [Parameter(Mandatory = $true)]
  [string]$TaskId,

  [string]$Agent = 'codex',
  [string]$Role = 'implementer',
  [string]$Title = 'Untitled task',
  [string]$Priority = 'medium',
  [string]$Outcome = 'partial',
  [string]$ReviewType = 'code-review'
)

$root = Split-Path -Parent $PSScriptRoot
$agentsRoot = Join-Path $root 'docs\agents'
$tasksDir = Join-Path $agentsRoot 'tasks'
$resultsDir = Join-Path $agentsRoot 'results'
$reviewsDir = Join-Path $agentsRoot 'reviews'

New-Item -ItemType Directory -Force -Path $tasksDir, $resultsDir, $reviewsDir | Out-Null

$taskPath = Join-Path $tasksDir "$TaskId.md"
$resultPath = Join-Path $resultsDir "$TaskId-$Agent.md"
$reviewPath = Join-Path $reviewsDir "$TaskId-review-$Agent.md"
$validationPath = Join-Path $resultsDir "$TaskId-validation-$Agent.md"

function Write-Utf8File {
  param(
    [string]$Path,
    [string]$Content
  )

  Set-Content -LiteralPath $Path -Value $Content -Encoding utf8
}

switch ($Command) {
  'new-task' {
    if (Test-Path $taskPath) {
      Write-Host "Task already exists: $taskPath"
      exit 0
    }

    $content = @"
# $TaskId — $Title

## Metadata

- Task ID: ``$TaskId``
- Role: ``$Role``
- Assigned agent: ``$Agent``
- Status: ``todo``
- Priority: ``$Priority``

## Objective

- <replace with one concrete objective>

## Current Repo Truth

- Read ``docs/agents/shared-context.md`` first.
- Add task-specific truths here.

## Owned Files

- <path>

## Do Not Change

- <path>

## Inputs

- <path>

## Required Output

- ``docs/agents/results/$TaskId-$Agent.md``

## Validation

- <validation>

## Notes

- Keep findings short and concrete.
"@

    Write-Utf8File -Path $taskPath -Content $content
    Write-Host "Created task: $taskPath"
  }

  'new-result' {
    if (Test-Path $resultPath) {
      Write-Host "Result already exists: $resultPath"
      exit 0
    }

    $content = @"
# RESULT-$TaskId-$Agent

## Summary

- Task: ``$TaskId``
- Agent: ``$Agent``
- Outcome: ``$Outcome``

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
"@

    Write-Utf8File -Path $resultPath -Content $content
    Write-Host "Created result: $resultPath"
  }

  'new-review' {
    if (Test-Path $reviewPath) {
      Write-Host "Review already exists: $reviewPath"
      exit 0
    }

    $content = @"
# REVIEW-$TaskId-$Agent

## Review Scope

- Task: ``$TaskId``
- Reviewer: ``$Agent``
- Review type: ``$ReviewType``

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
"@

    Write-Utf8File -Path $reviewPath -Content $content
    Write-Host "Created review: $reviewPath"
  }

  'show-prompt' {
    $outputLine = ''
    if ($Role -eq 'reviewer') {
      $outputLine = "  - review:  $($reviewPath.Replace($root + '\', ''))"
    }
    elseif ($Role -eq 'verifier') {
      $outputLine = "  - result: $($validationPath.Replace($root + '\', ''))"
    }
    else {
      $outputLine = "  - result: $($resultPath.Replace($root + '\', ''))"
    }

    $prompt = @"
Read these files first:
- docs/agents/shared-context.md
- $($taskPath.Replace($root + '\', ''))

Your assigned role is: $Role
Your agent label is: $Agent

Rules:
- Follow the task file exactly.
- Do not modify files outside your owned scope.
- Record assumptions that conflict with repo reality.
- Write your output to:
$outputLine

Required response structure:
1. summary
2. files touched or reviewed
3. findings
4. risks / unresolved
5. recommended next step
"@

    Write-Output $prompt
  }
}
