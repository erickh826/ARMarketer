# Gate 2 Mobile Validation — 2026-05-14

> Updated with real device evidence on 2026-05-18.

## Status

**RECORDED — real-device mobile validation executed on 2026-05-18.**

## Historical Blocker Detail

| Item | Status |
|---|---|
| Machine type | Windows Desktop (no mobile OS) |
| Target iPhone (12+/Safari) | Not connected |
| Target Android (12+/Chrome) | Not connected |
| Remote debugging (Chrome DevTools) | Not available |
| Safari Web Inspector | Not available |
| Mobile browser emulation | Not sufficient for GPU/memory stress |

## Validation Method

The mobile runs used URL-based asset targeting against the current Gate 2 stress asset:

- Tested asset: `cyberpunk_city.glb`
- Size: `142,987,188 bytes (~136.36 MB)`
- Invocation pattern:
  - `?url=/test-assets/cyberpunk_city.glb&type=glb`

## Recorded Results — 2026-05-18

| Device | OS | Browser | Load Time | Interaction | Console / Remote Debug | Context Loss / Tab Kill |
|---|---|---|---|---|---|---|
| iPhone 14 | iOS 26.4.2 | Safari | ~27s | smooth | not captured | none observed |
| Pixel 6 | Android 14 | Chrome | ~30s | usable, slightly slow | not captured | none observed |

## Interpretation

- Both tested mobile devices completed the large-asset load without browser crash, tab kill, or black-screen/context-loss behavior.
- The iPhone 14 Safari result was usable and smooth after load.
- The Pixel 6 Chrome result remained usable after load, but interaction was somewhat slower than on iPhone.
- Reported load time on both devices was around **27-30 seconds**.
- The tester noted network conditions likely contributed materially to load time; this report therefore treats the timing as field-observed rather than lab-grade isolated runtime measurement.

## Asset Reference Correction

The existing desktop Gate 2 report (`docs/session/2026-05-14-gate2-report.md`) references `low_poly_wood_crate.glb` as a 138 MB asset, but the actual file size is 1.7 MB. The real 137 MB large asset is `cyberpunk_city.glb`. The desktop test was presumably run against `cyberpunk_city.glb` but recorded with the wrong filename. This must be corrected before mobile validation proceeds.

## Decision

> **pass-with-warnings**

Gate 2 mobile validation now has real-device evidence that a ~136 MB GLB can load and remain operable on both iPhone Safari and Android Chrome without crash or context loss.

The warning is performance-related rather than functional:

- observed load time is relatively high at roughly 27-30 seconds
- Android interaction quality is usable but slightly degraded versus iPhone
- no remote-debug console or memory trace was captured during this run

## Validation Checklist

| Metric | Required | Recorded |
|---|---|---|
| Device model | Yes | iPhone 14; Pixel 6 |
| OS version | Yes | iOS 26.4.2; Android 14 |
| Browser + version | Yes | Safari; Chrome |
| Tested asset | cyberpunk_city.glb (136 MB) | Yes |
| Load time | Yes | ~27s; ~30s |
| Interaction quality | Yes | smooth; usable but slightly slow |
| Console errors | Yes | not captured |
| Context loss / tab kill | Yes | none observed |
| Memory observation | If available | not captured |
| Pass / Fail / Pass-with-warnings | Yes | pass-with-warnings |
