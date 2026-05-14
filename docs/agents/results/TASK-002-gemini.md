# TASK-002 Result — gemini (planner)

## 1. Summary

This document provides a concrete Gate 2 test plan and report structure for the ARMarketer 3D viewer. The goal is to empirically validate the viewer's ability to handle "100MB-class" assets, as required by Phase 1 milestones. This plan moves beyond the simple "blue cube" smoke test to establish a measurable performance baseline for high-fidelity assets (OBJ/FBX/GLB).

## 2. Files Touched or Reviewed

### Reviewed
- `docs/agents/tasks/TASK-002.md`
- `docs/plan/current-status.md`
- `docs/plan/phase1-checklist.md`
- `docs/agents/results/TASK-001A-validation-gemini.md`
- `src/components/ModelViewer.tsx`
- `src/App.tsx`

## 3. Findings

### 3.1 Test Scope: "100MB-class" Assets
Gate 2 requires evidence that the platform can load and operate assets similar to the high-quality legacy Zapworks content.
- **Target Asset Types:** OBJ (with textures), FBX, and optimized GLB (Draco compressed).
- **Target Size:** At least one asset should exceed 80MB (uncompressed) or represent a complex 100MB+ source file after conversion to a 10MB-20MB optimized GLB.
- **Complexity:** Assets should include multiple meshes and high-resolution (2K/4K) textures to test GPU memory limits.

### 3.2 Propose Device/Browser Matrix
Tests must be performed across a range of hardware to establish a realistic support baseline.

| Tier | Category | Example Device | Browsers |
|---|---|---|---|
| **Tier 1** | High-end Mobile | iPhone 15/16 Pro, Samsung S24 | Safari, Chrome |
| **Tier 2** | Mid-range Mobile | iPhone 12/13, Google Pixel 6/7 | Safari, Chrome |
| **Tier 3** | Desktop (Baseline) | M1/M2 Mac, Modern Windows PC | Chrome, Firefox |

### 3.3 Measurable Metrics
| Metric | Definition | Tooling |
|---|---|---|
| **TTR (Time to Ready)** | Time from page load start to "100%" progress UI visible. | Manual Timer / Console Log |
| **TTI (Time to Interaction)** | Time from 100% progress until OrbitControls are responsive. | Manual Interaction |
| **Peak Memory (JS)** | Highest JS heap usage during load/render. | Chrome DevTools (Memory) |
| **FPS (Idle)** | Frames per second with static model. | `stats.js` or browser overlay |
| **FPS (Interaction)** | Frames per second during rotate/zoom. | `stats.js` or browser overlay |
| **Stability** | Occurrence of crashes, OOM errors, or GL context loss. | Console / Device Logs |

### 3.4 Pass/Fail Thresholds
| Metric | Pass (Mobile) | Pass (Desktop) | Critical (Fail) |
|---|---|---|---|
| **TTR (10MB GLB)** | < 10s | < 5s | > 30s |
| **TTI** | < 2s after load | < 1s after load | > 5s |
| **FPS (Interaction)** | > 30 FPS | > 60 FPS | < 15 FPS |
| **Stability** | 100% (No crashes) | 100% (No crashes) | Any crash/context loss |

## 4. Risks / Unresolved

- **Large Asset Sourcing:** The repo currently lacks a legitimate 100MB-class test asset. The next agent (`implementer`) must source or provide a path to a valid high-size file.
- **Network Variability:** TTR is highly dependent on network speed. All tests should be performed on a stable high-speed connection or local server to isolate hardware/browser performance.
- **Draco Decoder Latency:** The current CDN-based Draco decoder may introduce overhead that should be noted in the report.

## 5. Recommended Next Step: Gate 2 Report Structure

The agent assigned to **execute** TASK-002 should follow this structure for the report at `docs/session/2026-05-14-gate2-report.md`:

### [Draft Template] Gate 2 Performance Report

#### 1. Test Environment
- **Device:** [e.g., iPhone 13]
- **OS/Browser:** [e.g., iOS 17.4 / Safari]
- **Connection:** [e.g., 100Mbps Wi-Fi]

#### 2. Test Asset
- **Filename:** [e.g., high_poly_statue.glb]
- **File Size:** [e.g., 15MB (Draco) / 110MB raw]
- **Vertex/Poly Count:** [e.g., 800k faces]

#### 3. Results
- **TTR:** [seconds]
- **TTI:** [seconds]
- **FPS (Interaction):** [avg FPS]
- **Peak Memory:** [MB]

#### 4. Observations
- [e.g., "Slight stutter during initial geometry upload to GPU"]
- [e.g., "Loading UI correctly reflects progress for large chunks"]

#### 5. Verdict
- [PASS / FAIL / PASS WITH WARNINGS]
