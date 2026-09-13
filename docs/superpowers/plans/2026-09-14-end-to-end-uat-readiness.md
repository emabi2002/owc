# OWC End-to-End UAT Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build repeatable reference end-to-end UAT evidence over the existing OWC synthetic/reference ecosystem and a separate formal production-like UAT acceptance package.

**Architecture:** Reuse the existing sandbox worker-claim journey, reference CPPS service and explicit CPPS backend selector. Add a small UAT orchestration/evidence layer that executes approved reference scenarios without duplicating business logic, emits safe release-linked JSON evidence, and keeps human/live acceptance as a separate gate.

**Tech Stack:** TypeScript, Bun tests/runtime, existing reference/sandbox services, Markdown, GitHub Actions artifacts.

**Spec:** `docs/superpowers/specs/2026-09-14-end-to-end-uat-readiness-design.md`

## Global Constraints

- Reference UAT must be labelled `REFERENCE/SANDBOX`.
- Silent mock fallback is prohibited; CPPS modes remain live/reference/unavailable.
- Synthetic payment must never claim real funds moved.
- UAT evidence must not include secrets or real claimant/medical/bank information.
- Automated reference UAT cannot produce human production sign-off.
- No production deployment or merge to `main`.

---

### Task 1: UAT contract

**Files:**
- Create: `src/lib/uat/reference-suite.test.ts`

**Interfaces:**
- Consumes: existing `runWorkerClaimDemo`, reference CPPS service and CPPS backend selector.
- Produces: CI-enforced requirements for seven reference scenarios, safe evidence and explicit service modes.

- [ ] Write failing tests requiring scenario IDs `REF-UAT-001` through `REF-UAT-007`.
- [ ] Require the happy path to include all 12 existing integration steps and safe correlation evidence.
- [ ] Require identity-failure, record-mismatch, payment-idempotency, CPPS lifecycle, invalid-transition and explicit-backend-selection scenarios.
- [ ] Require `REFERENCE/SANDBOX`, synthetic-data and no-production-acceptance labels.
- [ ] Confirm RED while all pre-existing tests stay green.

### Task 2: Reference UAT suite

**Files:**
- Create: `src/lib/uat/types.ts`
- Create: `src/lib/uat/reference-suite.ts`

**Interfaces:**
- Produces: `runReferenceUatSuite(options?)` returning a safe structured suite result.

- [ ] Define scenario/evidence/summary types.
- [ ] Implement REF-UAT-001 using the existing worker-claim demo.
- [ ] Implement REF-UAT-002 and REF-UAT-003 using existing override/failure behavior.
- [ ] Implement REF-UAT-004 by proving repeated synthetic payment produces the same transaction reference.
- [ ] Implement REF-UAT-005 with a fixed-time reference CPPS service and the complete allowed claim lifecycle through paid/closed, with `realFundsMoved: false`.
- [ ] Implement REF-UAT-006 by proving an invalid reference-CPPS jump throws/rejects.
- [ ] Implement REF-UAT-007 by exercising live/reference/unavailable backend-selection rules.
- [ ] Ensure suite result fails if any required scenario fails.

### Task 3: Evidence CLI and CI artifact

**Files:**
- Create: `scripts/uat/run-reference-suite.ts`
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: `bun run uat:reference` and a JSON evidence file.

- [ ] Add package script `uat:reference`.
- [ ] CLI resolves release SHA from `GITHUB_SHA` or `git rev-parse HEAD`.
- [ ] CLI writes to `OWC_UAT_EVIDENCE_PATH` or a safe default under `artifacts/`.
- [ ] CLI exits non-zero when suite summary fails.
- [ ] Add the UAT feature branch to CI allow-list.
- [ ] Run reference UAT after ordinary Bun tests and before lint/build.
- [ ] Upload the generated JSON as a GitHub Actions artifact using `actions/upload-artifact@v4`.
- [ ] Production deploy condition remains unchanged.

### Task 4: Human/reference UAT documentation

**Files:**
- Modify: `docs/UAT_CHECKLIST.md`
- Create: `docs/uat/reference-uat-plan.md`
- Create: `docs/uat/uat-evidence-template.md`
- Create: `docs/uat/production-uat-acceptance.md`

**Interfaces:**
- Produces: current tester instructions and clear reference/live acceptance boundaries.

- [ ] Remove the obsolete CPPS `source: mock` expectation.
- [ ] Document live/reference/unavailable backend behavior.
- [ ] Add scenario matrix covering REF-UAT-001 through 007.
- [ ] Define tester role coverage and evidence fields.
- [ ] Define `PASS`, `FAIL`, `BLOCKED/DEPENDENCY`, `NOT APPLICABLE` statuses.
- [ ] Cover public/claimant, admin/RBAC, Drupal, evidence/scanner, notification, integrations, browser/mobile/accessibility/security/performance.
- [ ] Require named business/security sign-off for formal production-like UAT.

### Task 5: Status and verification

**Files:**
- Modify: `docs/OWC_TASK_STATUS.md`
- Create: `docs/verification/end-to-end-uat-tdd.md`

**Interfaces:**
- Produces: reconciled Task 14 status and exact-head evidence.

- [ ] Mark Task 14 `REFERENCE UAT COMPLETE / LIVE ACCEPTANCE EXTERNAL` after repository suite/evidence is complete.
- [ ] Record RED-run evidence and reference/live boundary.
- [ ] Freeze final head and run exact-head security assurance, shell validation, Bun tests, reference UAT, lint/type-check, build and Drupal clean-room reconstruction.
- [ ] Verify the UAT JSON artifact exists for the exact-head CI run.
- [ ] Verify production SSH deployment is skipped.
- [ ] Preserve the verified branch as a draft PR stacked on `feature/security-assessment-readiness`.
