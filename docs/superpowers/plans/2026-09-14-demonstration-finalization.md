# OWC Demonstration Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Tasks 10–15 of the OWC demonstration programme with presentation reporting, officer workbenches, guarded failure/recovery controls, personas and presenter guidance, enforceable demonstration terminology, and a fail-closed release rehearsal.

**Architecture:** All new functionality sits behind the existing deterministic demonstration/reference boundaries and reuses the 20-record synthetic claim pack, existing demo identities, sandbox integrations, Task 9 UAT suite, and Administrator controls. No task may create a production integration, move money, infer a live host, or turn demonstration acceptance into production acceptance.

**Tech Stack:** Next.js 15, React 18, TypeScript, Bun test/runtime, existing OWC admin shell, GitHub Actions, existing sandbox/reference adapters.

**Spec:** This plan implements the approved continuation sequence after Task 9: dashboard/reporting → officer screens → failure/recovery controls → personas/presentation script → demonstration terminology → final rehearsal and OWC Demonstration Release.

## Global Constraints

- The environment label is `DEMONSTRATION` and all demonstration claim data is synthetic.
- `productionAcceptance` is always `false` for Tasks 10–15.
- No real funds may move; any payment presentation must state `simulation=true` and `moneyMovement=false`.
- No production payment API environment variable or live agency endpoint may be introduced.
- Failure/recovery controls may mutate only process-local sandbox service status and must fail closed outside the guarded demonstration mode.
- The existing Administrator-only demonstration reset boundary remains unchanged.
- Presentation-server credentials are external infrastructure. Repository code may classify host configuration but may not claim deployment without independent evidence.
- With no configured presentation host, the final release state is exactly `REPOSITORY_READY / DEMO_HOST_EXTERNAL`.
- Every task begins with a failing Bun test, receives the minimal implementation, and is followed by targeted verification.
- Final completion requires exact-head full CI, merge, and post-merge `main` verification.

---

### Task 10: Deterministic demonstration dashboard and reporting

**Files:**
- Create: `src/lib/demonstration/reporting.test.ts`
- Create: `src/lib/demonstration/reporting.ts`
- Create: `src/app/admin/(dashboard)/demonstration/page.tsx`
- Modify: `src/components/admin/admin-shell.tsx`

**Interfaces:**
- Consumes: `DEMONSTRATION_CLAIMS` from `src/lib/demonstration/data-pack.ts`.
- Produces: `buildDemonstrationReport()` returning deterministic totals, status/decision counts, notification failures, average turnaround, simulated-payment counts and illustrative payment amount with `moneyMovement:false`.

- [ ] **Step 1: Write the failing reporting test** with exact expected values from the 20-record synthetic pack.
- [ ] **Step 2: Run `bun test src/lib/demonstration/reporting.test.ts`** and verify failure because the reporting module/UI do not yet exist.
- [ ] **Step 3: Implement the report builder and presentation dashboard**. The dashboard must visibly display `DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS` and `productionAcceptance=false`.
- [ ] **Step 4: Add a `Demonstration` admin navigation item** without changing existing production/admin routes.
- [ ] **Step 5: Re-run the targeted test and commit** as `feat: add demonstration dashboard reporting`.

### Task 11: Officer demonstration workbenches

**Files:**
- Create: `src/lib/demonstration/officer-workbench.test.ts`
- Create: `src/lib/demonstration/officer-workbench.ts`
- Create: `src/app/admin/(dashboard)/demonstration/officer/page.tsx`
- Create: `src/app/admin/(dashboard)/demonstration/officer/[reference]/page.tsx`

**Interfaces:**
- Consumes: deterministic claims and existing demonstration persona IDs.
- Produces: `buildOfficerWorkbench(personaId)` with read-only synthetic queues.

- [ ] **Step 1: Write failing queue tests** requiring claims-officer = RECEIVED/DOCUMENTS_REQUIRED, assessment-officer = ASSESSMENT, finance-officer = APPROVED/PAYMENT_SCHEDULED/SIMULATED_PAYMENT.
- [ ] **Step 2: Run the targeted test and confirm RED**.
- [ ] **Step 3: Implement persona-specific queue selection and presentation pages**. Pages are read-only and must not expose real payment mutations.
- [ ] **Step 4: Verify counts and claim detail routing**.
- [ ] **Step 5: Commit** as `feat: add demonstration officer workbenches`.

### Task 12: Guarded failure and recovery controls

**Files:**
- Create: `src/lib/demonstration/service-controls.test.ts`
- Create: `src/lib/demonstration/service-controls.ts`
- Create: `src/app/api/admin/demonstration/services/route.ts`
- Create: `src/components/admin/demonstration-service-controls.tsx`
- Modify: `src/app/admin/(dashboard)/demonstration/page.tsx`

**Interfaces:**
- Consumes: sandbox service types/state and the existing demonstration reset enablement pattern.
- Produces: `isDemonstrationServiceControlEnabled(configuration)`, `setDemonstrationServiceStatus(...)`, and an Administrator-only HTTP boundary.

- [ ] **Step 1: Write failing tests** proving controls are disabled outside `OWC_IDENTITY_MODE=demonstration` + `OWC_ENABLE_DEMO_RESET=true`, accept only sandbox services/statuses, and return `productionConnected:false`.
- [ ] **Step 2: Confirm RED**.
- [ ] **Step 3: Implement the library and Administrator-only route**. The route must return 404/403/fail-closed when the presentation boundary is unavailable.
- [ ] **Step 4: Add UI controls to the demonstration page** for online/degraded/offline simulation and reset-to-online only.
- [ ] **Step 5: Verify sandbox recovery and commit** as `feat: add guarded demonstration service controls`.

### Task 13: Demonstration personas and presenter script

**Files:**
- Create: `src/lib/demonstration/presentation.test.ts`
- Create: `src/lib/demonstration/presentation.ts`
- Create: `docs/demonstration/presentation-script.md`

**Interfaces:**
- Consumes: `listDemoPrincipals()` and Task 9 scenario IDs.
- Produces: `buildPresentationGuide()` containing all seven personas, presenter routes, seven UAT scenario classes, reset/recovery guidance, and boundary statements.

- [ ] **Step 1: Write failing tests** requiring all seven existing personas and all seven Task 9 scenarios.
- [ ] **Step 2: Confirm RED**.
- [ ] **Step 3: Implement the deterministic guide and human-readable script** with no credentials embedded.
- [ ] **Step 4: Verify the script explicitly states synthetic data, simulated payments, no production acceptance and external host status**.
- [ ] **Step 5: Commit** as `docs: add OWC demonstration personas and presentation script`.

### Task 14: Enforceable demonstration terminology

**Files:**
- Create: `src/lib/demonstration/terminology.test.ts`
- Create: `src/lib/demonstration/terminology.ts`
- Create: `scripts/demonstration/verify-terminology.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `DEMONSTRATION_BANNER`, `verifyDemonstrationTerminology(text)` and `demo:terminology`.

- [ ] **Step 1: Write failing tests** accepting safe demonstration wording and rejecting claims such as `production accepted`, `real funds transferred`, `live payment complete`, and `deployed to OWC production`.
- [ ] **Step 2: Confirm RED**.
- [ ] **Step 3: Implement central terminology and the scoped verification runner** over demonstration UI/docs only.
- [ ] **Step 4: Run `bun run demo:terminology`** and correct any presentation wording that violates the contract.
- [ ] **Step 5: Commit** as `test: enforce demonstration terminology boundary`.

### Task 15: Final rehearsal and OWC Demonstration Release

**Files:**
- Create: `src/lib/demonstration/release.test.ts`
- Create: `src/lib/demonstration/release.ts`
- Create: `scripts/demonstration/run-release-rehearsal.ts`
- Create: `docs/verification/demonstration-release.md`
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Task 9 `runDemonstrationUatSuite()`, Tasks 10–14 deterministic contracts, and host configuration shape only.
- Produces: `buildDemonstrationRelease(options)` and JSON release evidence at `artifacts/demonstration-release.json`.

- [ ] **Step 1: Write failing release tests** requiring repository-ready state, seven passing presentation UAT scenarios, `productionAcceptance=false`, and exact external-host classification when host variables are absent.
- [ ] **Step 2: Confirm RED**.
- [ ] **Step 3: Implement the release builder and rehearsal runner**. Credential values must never be printed; only missing variable names may be reported.
- [ ] **Step 4: Add `demo:release` and CI artifact preservation**. CI must run the rehearsal before lint/build and upload its JSON evidence even when later gates fail.
- [ ] **Step 5: Run targeted tests, `bun run demo:terminology`, and `bun run demo:release`**.
- [ ] **Step 6: Run exact-head full CI** covering repository assurance, all tests, reference UAT, demonstration UAT, release rehearsal, type-check/build and Drupal clean-room.
- [ ] **Step 7: Merge only the verified exact head**, then re-run all gates on `main`.
- [ ] **Step 8: Final status** is `REPOSITORY_READY / DEMO_HOST_EXTERNAL` unless actual presentation-host configuration and independent host verification exist; never infer deployment from repository readiness.
