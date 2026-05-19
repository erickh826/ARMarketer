# Session Note — 2026-05-18

## Summary

- Gate 2 mobile evidence was recorded from real-device testing and accepted as `pass-with-warnings`.
- Gate 2 is no longer blocking the main implementation path.
- The default viewer fallback was changed to a repo-safe tracked asset.
- URL-based asset targeting is now the documented method for Gate 2 / mobile validation runs.
- The Python dependency gap for the Docker-free pipeline was partially closed with `pipeline/requirements.txt`.

## Recorded Mobile Evidence

Test asset:

- `cyberpunk_city.glb`
- `142,987,188 bytes (~136.36 MB)`

Devices:

- iPhone 14 / iOS 26.4.2 / Safari
  - load time: ~27s
  - interaction: smooth
  - crash / context loss: none observed
- Pixel 6 / Android 14 / Chrome
  - load time: ~30s
  - interaction: usable, slightly slow
  - crash / context loss: none observed

Notes:

- field-observed timing likely includes meaningful network cost
- no remote-debug console or memory trace was captured

## Decisions Reinforced

- Gate 2 remains accepted as `pass-with-warnings`, not a clean full pass.
- The stricter instrumented mobile rerun is now a follow-up item, not a blocker.
- The main path should move to `TASK-006`.

## Next Main Task

- `TASK-006`
- Objective: implement the first managed source -> derived `MediaAsset` lineage proof with an R2-aligned contract shape.

## Follow-Up 1

- Re-run Gate 2 mobile validation with instrumentation:
  - capture remote-debug console output
  - capture memory observations if available
  - separate network wait from decode/render time

This follow-up is useful for tighter performance understanding, but it should not block `TASK-006`.
