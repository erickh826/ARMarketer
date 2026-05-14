# Backend Skeleton Next Risks
> Reference: docs/plan/phase_plan/phase1.md
> Date: 2026-05-14

## Findings

### 1. Upload placeholder is marked as uploaded before any bytes are verified

`POST /api/assets/upload` currently creates the `MediaAsset` placeholder immediately after issuing authorization.

- Authorization is issued in `server/examples/next-app-router/app/api/assets/upload/route.ts`
- Placeholder creation is also completed in the same request
- `MediaAssetService.createUploadPlaceholder()` writes `status: UPLOADED`

This means the database can say an asset is uploaded even if:

- the client never performs the `PUT`
- the `PUT` fails halfway
- the uploaded bytes do not match the declared file metadata

**Risk:** orphaned assets, incorrect pipeline triggers, and false-positive CMS state.

**Recommended next step:** add an upload completion/finalize step that verifies storage object existence, size, and optional checksum before moving the asset into confirmed uploaded state.

---

### 2. Upload authorization policy is advisory only; local upload route does not enforce declared file constraints

The upload request collects `mimeType` and `fileSizeBytes`, but the local `PUT /uploads/[...path]` route currently accepts arbitrary bytes and does not compare the actual upload against the declared metadata.

Current behavior:

- `POST /api/assets/upload` validates declared size only at request time
- `PUT /uploads/[...path]` writes whatever request body arrives
- No actual size check, checksum check, or MIME allowlist exists in the write path

**Risk:** clients can upload content that does not match the declared asset record, weakening later pipeline assumptions.

**Recommended next step:** persist expected upload metadata and verify it during finalize, or enforce it directly in the local upload route for development parity.

---

### 3. ARExperience domain validation is still incomplete

`ARExperienceService.create()` correctly verifies project ownership for `imageTargetId` and `mediaAssetId`, but it does not verify that `contentType` matches the linked asset kind.

Example invalid state that is still possible:

- `ARExperience.contentType = PANORAMA_360`
- linked `MediaAsset.kind = MODEL_3D`

**Risk:** valid relational state but invalid product state; viewer/runtime selection can break later.

**Recommended next step:** add a type-match guard between `ARExperience.contentType` and `MediaAsset.kind` in service-level validation.

---

### 4. ImageTarget binding integrity is still too generic for W5 UI work

`ImageTargetService` has generic `update()` and `updateCompileStatus()`, but there is still no dedicated `bindExperience()` or equivalent method for the `boundExperienceId` relation.

That means future UI/API code could bind an experience through generic update logic without reusing the same cross-project safety rules already applied elsewhere.

**Risk:** relation integrity drifts as soon as target-management UI starts writing this field.

**Recommended next step:** add a dedicated binding method with project ownership validation before W5 target-management work starts.

---

### 5. Example routes still have no error normalization or auth boundary

This is acceptable for a skeleton, but it is the next operational risk once the current compile/build baseline is stable.

Current behavior:

- routes call services directly
- thrown service/storage errors will bubble as generic server failures
- no auth middleware exists on upload or viewer config routes

**Risk:** poor client-facing failure modes now, and security exposure once these examples are adapted into real app routes.

**Recommended next step:** add route-level error mapping and define the future auth boundary before CMS UI integration expands.

## Suggested Priority

1. Upload finalize/verification flow
2. Asset kind vs contentType validation
3. Dedicated image-target binding method
4. Route-level error normalization and auth plan