# OWC Demonstration Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the OWC presentation environment from deterministic synthetic data/reset through final rehearsal and release evidence, without connecting real payment infrastructure or falsely claiming unavailable external services are live.

**Architecture:** Preserve the existing live/reference adapter boundaries. Add a presentation-only control plane around the already implemented synthetic identity, CPPS, evidence, scanner, notification and government/provider services; build deterministic fixtures, reset/recovery, management projections, operator screens and repeatable UAT/rehearsal evidence. Actual Ubuntu SSH deployment remains an external gate until demonstration-host secrets are supplied.

**Tech Stack:** Next.js 15, React 18, TypeScript, Bun tests, Drupal 11/PostgreSQL clean-room CI, GitHub Actions.

**Spec:** Approved OWC 15-task demonstration programme in project conversation; current repository status in `docs/OWC_TASK_STATUS.md` and presentation flow in `docs/RFQ_LIVE_DEMO_SCRIPT.md`.

## Global Constraints

- Demonstration/reference services must be explicit and synthetic; production must never silently fall back to them.
- No real bank/payment connector. All payment records remain simulation-only with `moneyMovement: false`.
- Reset and seed controls must be unavailable unless demonstration/reference mode is explicitly enabled.
- No real claimant, medical, banking or agency production data may be seeded.
- Exact-head full CI is required before every merge to `main`.
- Merged `main` must be verified after every task.
- Actual production cutover and live agency acceptance remain separate post-award work.

---

### Task 7: Deterministic demonstration data pack and reset

**Files:**
- Create: `src/lib/demonstration/data-pack.ts`
- Create: `src/lib/demonstration/reset.ts`
- Create: `src/lib/demonstration/reset.test.ts`
- Create: `src/app/api/demonstration/reset/route.ts`
- Modify: `src/lib/cpps/reference/runtime.ts`
- Modify: `src/lib/integrations/sandbox/agencies.ts`
- Modify: `src/lib/integrations/sandbox/events.ts`
- Reuse: `src/lib/claims/reference-evidence-repository.ts`
- Reuse: `src/lib/integrations/sandbox/state.ts`

**Interfaces:**
- Produces `DEMONSTRATION_CLAIMS` with 15–30 deterministic synthetic claim summaries spanning lifecycle states.
- Produces `resetDemonstrationEnvironment()` returning a safe reset report.
- Produces guarded `POST /api/demonstration/reset` available only in explicit demonstration mode.

- [ ] Write RED tests for deterministic claim count/lifecycle coverage, CPPS reset, evidence reset, payment/event/service reset and production-mode denial.
- [ ] Prove RED.
- [ ] Implement reset hooks and data pack.
- [ ] Run full CI, merge, verify merged `main`.

### Task 8: Presentation deployment package

**Files:**
- Create: `docs/operations/demonstration-deployment.md`
- Create: `deploy/demo-preflight.sh`
- Create: `src/lib/operations/demonstration-deployment.test.ts`
- Modify: `.env.example`
- Modify: `package.json`

**Interfaces:**
- Produces a deterministic demo preflight that validates required demo-mode variables without printing secrets.
- Does not fabricate host/DNS/TLS; actual SSH remains conditional on existing GitHub secrets.

- [ ] Write RED contract for demo environment variables, fail-closed live-payment prohibition, reset readiness and safe preflight output.
- [ ] Prove RED.
- [ ] Implement preflight/runbook/package script.
- [ ] Run full CI, merge, verify merged `main`.
- [ ] If deployment secrets remain absent, record `DEMO HOST EXTERNAL` and continue remaining repository tasks.

### Task 9: Presentation-level end-to-end UAT

**Files:**
- Create: `src/lib/uat/demonstration-suite.ts`
- Create: `src/lib/uat/demonstration-suite.test.ts`
- Create: `scripts/uat/run-demonstration-suite.ts`
- Create: `docs/verification/demonstration-uat.md`
- Modify: `package.json`

**Interfaces:**
- Produces `DEMONSTRATION` evidence with `demonstrationAcceptance=true` and `productionAcceptance=false`.
- Covers successful claim, missing documents, identity mismatch, infected evidence, rejected claim, simulated payment idempotency and outage/recovery.

- [ ] Write RED scenario/evidence contract.
- [ ] Prove RED.
- [ ] Implement suite and evidence runner.
- [ ] Run full CI, merge, verify merged `main`.

### Task 10: Management dashboard and reporting verification

**Files:**
- Create: `src/lib/demonstration/dashboard.ts`
- Create: `src/lib/demonstration/dashboard.test.ts`
- Create: `src/app/api/demonstration/dashboard/route.ts`
- Create/modify presentation admin dashboard UI under `src/app/admin`.

**Interfaces:**
- Produces synthetic counts by status/province/industry, outstanding assessments, decisions, simulated payments, turnaround, employers, activity and notification outcomes.

- [ ] Write RED dashboard projection contract.
- [ ] Prove RED.
- [ ] Implement deterministic reporting projection and screen/API.
- [ ] Run full CI, merge, verify merged `main`.

### Task 11: Officer/admin operational presentation screens

**Files:**
- Create: `src/lib/demonstration/operations.ts`
- Create: `src/lib/demonstration/operations.test.ts`
- Create/modify admin presentation routes under `src/app/admin` for claim search, evidence, workflow, audit, role, notification and integration state.

**Interfaces:**
- Reuses existing RBAC; finance/assessment remain separated; employer/claimant do not gain staff access.

- [ ] Write RED coverage for required screens/actions and role visibility.
- [ ] Prove RED.
- [ ] Implement presentation-safe operational projections/screens.
- [ ] Run full CI, merge, verify merged `main`.

### Task 12: Error, outage and recovery scenarios

**Files:**
- Create: `src/lib/demonstration/scenarios.ts`
- Create: `src/lib/demonstration/scenarios.test.ts`
- Create: `src/app/api/demonstration/scenarios/route.ts`
- Reuse sandbox service-state controls and EICAR reference scanner.

**Interfaces:**
- Provides deterministic scenarios for NID mismatch, employer not found, expired insurance, infected document, simulated payment rejection, notification failure and temporary CPPS/service outage with reset/recovery.

- [ ] Write RED scenario state-machine contract.
- [ ] Prove RED.
- [ ] Implement bounded scenario controls available only in demo mode.
- [ ] Run full CI, merge, verify merged `main`.

### Task 13: Presentation personas and script finalization

**Files:**
- Create: `docs/DEMONSTRATION_PERSONAS.md`
- Modify: `docs/RFQ_LIVE_DEMO_SCRIPT.md`
- Create: `src/lib/demonstration/presentation-contract.test.ts`

**Interfaces:**
- Defines fixed Claimant, Employer, Claims Officer, Assessment Officer, Finance Officer and Administrator hand-offs.
- Main scenario remains synthetic and payment remains simulation-only.

- [ ] Write RED contract for personas, role hand-offs, happy/negative paths and fallback instructions.
- [ ] Prove RED.
- [ ] Update documents to match current routes/data.
- [ ] Run full CI, merge, verify merged `main`.

### Task 14: Demonstration status terminology

**Files:**
- Modify: `docs/OWC_TASK_STATUS.md`
- Modify: `docs/HANDOVER.md`
- Create: `src/lib/operations/demonstration-status.test.ts`

**Interfaces:**
- Uses `DEMONSTRATION COMPLETE`, `REFERENCE/REPLICA COMPLETE`, `POST-AWARD LIVE MIGRATION REQUIRED`, and `DEMO HOST EXTERNAL` where applicable.
- Does not promote production gates.

- [ ] Write RED status-language safeguards.
- [ ] Prove RED.
- [ ] Reconcile documentation with exact repository evidence.
- [ ] Run full CI, merge, verify merged `main`.

### Task 15: Final presentation-readiness rehearsal and release

**Files:**
- Create: `src/lib/operations/demonstration-release.ts`
- Create: `src/lib/operations/demonstration-release.test.ts`
- Create: `scripts/demonstration/rehearse.ts`
- Create: `docs/verification/OWC_DEMONSTRATION_RELEASE.md`
- Modify: `package.json`

**Interfaces:**
- Produces fail-closed final rehearsal result and JSON evidence tied to immutable release SHA.
- Requires clean reset, persona coverage, integration health, evidence/scanner, UAT, dashboard, operational screens, negative/recovery scenarios, simulated payment/no-money-movement and presentation script alignment.
- If the actual presentation host is not configured, release state must be `REPOSITORY_READY / DEMO_HOST_EXTERNAL`, never falsely `DEPLOYED`.

- [ ] Write RED release-gate contract.
- [ ] Prove RED.
- [ ] Implement rehearsal/evidence runner.
- [ ] Run complete tests/UAT/build/Drupal clean-room.
- [ ] Merge and verify `main`.
- [ ] Record final OWC Demonstration Release state with explicit external-host boundary if still applicable.
