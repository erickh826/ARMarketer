# TASK-009 Review — Target-Experience Binding

## 1. Summary
I have reviewed the implementation for TASK-009. The implementer successfully added the 7 required routes for `ARExperience` CRUD operations and Target-Experience binding, properly wiring them into the Express host. The routes follow the established patterns from TASK-008 and correctly implement the required functionality without introducing unauthorized changes to the schema or service layer. However, a minor gap in validation during `PATCH` operations was identified.

## 2. Files Touched or Reviewed
- `server/examples/next-app-router/app/api/experiences/route.ts`
- `server/examples/next-app-router/app/api/experiences/[id]/route.ts`
- `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts`
- `server/examples/express-host/index.js`
- `server/services/ar-experience.service.ts`
- `prisma/schema.prisma`

## 3. Findings
- **Auth consistency**: Excellent. All 7 routes consistently require the `x-api-key` header and validate it against the appropriate `projectId` via `requireApiKey()`. For routes with `[id]`, the resource is correctly fetched first to establish ownership before authorizing.
- **Same-project validation pattern**: 
  - `POST /api/experiences`: Handled correctly by `arExperienceService.create()`, which validates both `imageTargetId` and `mediaAssetId` cross-project constraints.
  - `PATCH /api/experiences/:id`: Explicit validation was correctly added for `imageTargetId` to ensure it belongs to the same project. **However, explicit same-project validation for `mediaAssetId` was omitted in the PATCH route.** Since `arExperienceService.update()` does not validate this internally (unlike `.create()`), an experience could theoretically be updated to reference a `mediaAssetId` from a different project if the client bypasses UI constraints.
  - `POST /api/targets/:targetId/bind/:experienceId`: Correctly validates that the target and experience share the same `projectId`, and that the experience's `imageTargetId` matches the target being bound.
- **CORS Changes**: No unsafe CORS changes were made. The Express host setup correctly handles `OPTIONS` requests and allows necessary methods/headers globally for the examples.
- **Binding Semantics**: Correctly handled. The bind endpoint uses the `boundExperienceId` field, which correctly establishes the one-to-one relationship. Unbinding properly nullifies this field.
- **Includes/relations**: Correctly handled. The `GET` endpoints utilize the service layer methods which already include the `imageTarget` and `mediaAsset` relations, fulfilling the requirement for the viewer payload.
- **Service-layer / Schema**: Confirmed that no unauthorized changes were made to `server/services/**`, `prisma/**`, or `src/**`.

## 4. Risks / Unresolved
- **Missing `mediaAssetId` Project Validation on PATCH**: The `PATCH /api/experiences/:id` route should validate that `body.mediaAssetId` (if provided) belongs to the same project as the experience, matching the strictness of the `imageTargetId` validation. This is a low-to-medium security risk since API keys are project-scoped, but it violates the schema integrity guarantees.

## 5. Recommended Next Step
- **Verifier Task**: The verifier agent should execute the full smoke test to validate functionality end-to-end.
- **Remediation**: The implementer or verifier should quickly add the missing same-project validation for `mediaAssetId` in `server/examples/next-app-router/app/api/experiences/[id]/route.ts`. 
- **Advance to W5/W6**: After validation, proceed to the Hotspot editor UI or MindAR React/R3F integration spike.
