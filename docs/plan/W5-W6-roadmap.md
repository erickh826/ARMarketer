# W5–W6 Roadmap — After TASK-008

> Current date: 2026-06-12
> TASK-008 (ImageTarget API) is complete. Next stage planning.

## W5 Remaining (2–3 weeks)

| Task | Owner | Priority | Delivery | Notes |
|---|---|---|---|---|
| **TASK-009: Target-Experience Binding** | — | High | `docs/agents/tasks/TASK-009.md` | ARExperience CRUD + bind/unbind endpoints. 5–7 new routes. Depends: none. Unblocks: W6 viewer. Est. 2–3h. |
| **Hotspot Editor UI v1** | — | Medium | W5 follow-up (after TASK-009) | Initial UI surface to edit hotspots on an experience. Backend: reuse TASK-009 experience APIs. Est. 3–5h. |

### Recommended Sequence

1. **Now (2026-06-12):** Assign TASK-009 to implementer agent  
   - Review + verify should complete by 2026-06-13
2. **2026-06-14:** Start hotspot editor UI (depends on TASK-009 baseline)
3. **2026-06-15 EOD:** W5 targeted complete

---

## W6 Priority (3–4 weeks)

### 1. MindAR + React/R3F Integration Spike

**Objective:** Embed MindAR (1.2.5) directly into the React/R3F app to replace A-Frame POC.

**Scope:**
- Port `public/poc.html` logic into a new React component
- Integrate `@react-three/fiber` viewer with MindAR tracking
- Consume `GET /api/projects/:slug/experience` (from next item) to drive the viewer
- Validate Gate 1 still passes with new implementation

**Unblocks:** Viewer reads CMS data (next item)  
**Est.:** 4–6 hours  

**Planning steps:**
1. Spike MindAR lifecycle in React (componentDidMount, event listeners, cleanup)
2. Understand tracking anchor/overlay model in 3D space
3. Integrate with existing `ModelViewer` component
4. Test with real phone

---

### 2. Viewer Reads CMS-Backed Experience

**Objective:** `GET /api/projects/:slug/experience` drives the full viewer experience instead of query-param assets.

**What it does:**
- Client loads `?slug=smoke-test` instead of `?url=http://…`
- App calls `GET /api/projects/smoke-test/experience` → gets full `ARExperience` record with `imageTarget` + `mediaAsset`
- Viewer receives `imageTargetId` (triggers MindAR) + `mediaAssetId` (triggers 3D load)

**Dependencies:**
- TASK-009 (target binding) must exist for data coherence
- MindAR integration (above) must exist to consume `imageTargetId`

**Est.:** 2–3 hours  

---

### 3. Hotspot Interaction (Optional W6)

If time permits, add click-to-interact on hotspots within the 3D model using raycasting.

**Est.:** 3–5 hours (likely pushes to W7)

---

## Gate 5 Considerations (W6 end)

No formal Gate 5 in the current plan, but by end of W6, the system should support:

- ✅ Image tracking (Gate 1)  
- ✅ 3D asset loading (Gate 2/3)  
- ✅ Target data (TASK-008, TASK-009)  
- ✅ Experience data flow (MindAR + viewer integration)  
- ✅ CMS-driven experience (viewer reads API)

---

## Risk / Blockers

| Risk | Mitigation |
|---|---|
| MindAR + React/R3F integration complexity | Spike first; reuse existing Gate 1 `1.2.5` library version (locked, tested). |
| Real phone testing during W6 | Allocate 1–2 hours for localtunnel + device validation. |
| Schema/API contract mismatch | Verify TASK-009 includes correct nested relations (`imageTarget`, `mediaAsset`). |

---

## Success Criteria for "W5–W6 Complete"

- [ ] TASK-009 routes are mounted and verified
- [ ] ARExperience CRUD works end-to-end
- [ ] Target-experience binding works (bind/unbind)
- [ ] MindAR + React/R3F integration tested on real phone
- [ ] Viewer reads `GET /api/projects/:slug/experience` successfully
- [ ] Full workflow: target tracked → experience loaded → model displayed
- [ ] All routes pass auth checks with `x-api-key`
- [ ] `npm run typecheck:server` passes
- [ ] Hotspot editor UI baseline or roadmap clearly defined for W7

---

## Next Steps

1. ✅ TASK-009 created (`docs/agents/tasks/TASK-009.md`)
2. ✅ TASK-009 planning created (`docs/plan/TASK-009-plan.md`)
3. 📋 Assign TASK-009 to implementer
4. 📋 After TASK-009 validation (2026-06-13), start MindAR integration spike

**Owner:** Ready for assignment  
**Est. total W5–W6 effort:** 12–16 engineer-hours
