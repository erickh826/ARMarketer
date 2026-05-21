# Gate 1 Test Protocol — MindAR Image Tracking Stability

> Date: 2026-05-21
> Status: IN PROGRESS — fill in Section 3 results during device run

## 1. Objective

Determine whether MindAR 1.2.5 (A-Frame mode) is stable enough on target phones to commit to it as the Phase 1 AR tracking library.

**Pass threshold:** Both primary platforms (iOS Safari + Android Chrome) must detect and hold the target image without crashing.  
**Fallback trigger:** See Section 4.

---

## 2. Test Setup

### 2.1 Serve the POC

In your project directory:

```bash
npm run dev -- --host
```

Vite will print a Network URL like `http://10.200.25.74:5173`. Open `http://<ip>:5173/poc.html` on each test device.

> **Note:** Both the test device and this machine must be on the same Wi-Fi network. The 10.5.0.2 address is an alternative if 10.200.25.74 doesn't reach your phones.

### 2.2 Target image

The POC uses the MindAR demo card target. Display or print this image on a second screen:

```
https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png
```

Recommended: open the URL on a laptop and point the phone at the screen (~30cm distance, good lighting).

### 2.3 What the POC does

On detection, a flat overlay of the same card image appears locked to the target. There is no 3D model in this POC — that is intentional. Gate 1 only validates tracking stability, not AR content.

---

## 3. Test Matrix

Fill in each row during the device run. Rate tracking stability as:
- **Stable** — overlay holds position for ≥10s without visible jitter or drop
- **Jittery** — overlay detects but shakes/drifts noticeably
- **Unstable** — detects but drops tracking within <5s repeatedly
- **No detect** — camera opens but target is never recognised
- **Crash** — page or browser crashes

| # | Device | OS Version | Browser | Camera opens? | Target detected? | Detection latency (s) | Tracking quality | Stable ≥10s? | Crash? | Notes |
|---|--------|------------|---------|:---:|:---:|:---:|---|:---:|:---:|-------|
| 1 | | | Safari | | | | | | | |
| 2 | | | Chrome | | | | | | | |
| 3 | | | | | | | | | | |

---

## 4. Pass / Fail Criteria

### Pass
All of the following must be true for Gate 1 to pass:

- [ ] Camera permission dialog appears on first load (no silent failure)
- [ ] Target card detected within **8 seconds** on at least one iOS device (Safari)
- [ ] Target card detected within **8 seconds** on at least one Android device (Chrome)
- [ ] Tracking rated **Stable** or better on both primary devices
- [ ] No crash or hard browser freeze on either primary device

**Result: PASS / FAIL / PASS-WITH-WARNINGS** ← fill in after run

### Pass-with-warnings
Same as pass but with one or more of:
- Detection latency between 8–15 seconds
- Tracking rated Jittery (not Stable) on one platform
- Required page reload to recover tracking

---

## 5. Fallback Trigger

If Gate 1 fails, the fallback decision is triggered by any of:

| Trigger condition | Fallback action |
|---|---|
| Crash on either primary platform | Evaluate AR.js (WebXR-based) or 8th Wall (paid) |
| Target never detected on both platforms | Re-evaluate `.mind` compilation quality; if still failing, switch to QR-code-only delivery for Phase 1 |
| Tracking rated Unstable on both platforms | Hold MindAR as candidate but default to static 3D viewer with manual activation; revisit after MindAR 1.3+ release |
| Detection latency consistently >15s | Add a loading/initialisation progress indicator; defer Gate 1 pass until UX is acceptable |

---

## 6. Gate 1 Result

> Fill in after completing Section 3.

- **Result:** _(PASS / FAIL / PASS-WITH-WARNINGS)_
- **Primary iOS device:**
- **Primary Android device:**
- **Notable issues:**
- **Fallback triggered?** _(yes / no)_

Update `docs/plan/phase1-checklist.md` Gate Result Log once complete.
