# Reference CPPS Ecosystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ad-hoc CPPS mock fallback with a realistic, explicitly synthetic reference CPPS that supports the OWC claim lifecycle and can later be swapped for the real CPPS adapter.

**Architecture:** Keep `src/lib/cpps/api.ts` as the stable OWC-facing boundary. Add a reference CPPS domain service and HTTP façade behind an explicit reference-ecosystem flag. Live CPPS configuration always wins over reference mode.

**Tech Stack:** Next.js 15, TypeScript 5.8, Bun test, existing OWC environment/configuration patterns.

**Spec:** `docs/superpowers/specs/2026-09-13-reference-cpps-ecosystem-design.md`

## Global Constraints

- Synthetic data only.
- Reference responses must use `source: "reference"`.
- No real bank transfer or production CPPS claim.
- Reference HTTP routes are disabled by default.
- Existing public claim route shapes remain stable.
- No merge/deploy to `main` as part of this plan.

---

### Task 1: Reference CPPS domain contract

**Files:**
- Create: `src/lib/cpps/reference/types.ts`
- Create: `src/lib/cpps/reference/service.test.ts`
- Create: `src/lib/cpps/reference/service.ts`

**Interfaces:**
- Produces `ReferenceCppsClaim`, `ReferenceCppsState`, `ReferenceCppsEvent`, `ReferenceCppsService`.

- [ ] Write failing tests for claim registration, retrieval and lifecycle transition validation.
- [ ] Run CI and confirm RED because reference modules do not yet exist.
- [ ] Implement minimal domain types/service to pass.
- [ ] Verify tests green.

### Task 2: Assessment and synthetic payment

**Files:**
- Modify: `src/lib/cpps/reference/service.test.ts`
- Modify: `src/lib/cpps/reference/service.ts`

**Interfaces:**
- Produces `assessClaim(reference, weeks)` and `recordSyntheticPayment(reference)`.

- [ ] Add failing tests proving assessment is labelled as assumed and payment is idempotent.
- [ ] Implement minimal assessment/payment behavior.
- [ ] Verify tests green.

### Task 3: OWC adapter compatibility

**Files:**
- Create: `src/lib/cpps/reference/contract.test.ts`
- Create: `src/lib/cpps/reference/contract.ts`
- Modify: `src/lib/cpps/types.ts`
- Modify: `src/lib/cpps/api.ts`

**Interfaces:**
- Consumes reference service claim state.
- Produces existing `CppsClaimStatus`, `CppsLodgeResult`, employer/injury/enquiry contracts with `source: "reference"`.

- [ ] Write failing tests for mapping the reference claim to the existing tracking contract.
- [ ] Expand result source to `cpps | reference`.
- [ ] Delegate non-live CPPS behavior to the reference service.
- [ ] Verify existing portal contract remains compatible.

### Task 4: Controlled HTTP façade

**Files:**
- Create: `src/app/api/reference/cpps/health/route.ts`
- Create: `src/app/api/reference/cpps/claims/route.ts`
- Create: `src/app/api/reference/cpps/claims/[reference]/route.ts`
- Modify: `src/lib/env.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes `OWC_ENABLE_REFERENCE_ECOSYSTEM`.
- Produces non-production JSON endpoints for demo/UAT only.

- [ ] Add route/config tests showing the façade is disabled by default.
- [ ] Implement explicit opt-in reference routes.
- [ ] Ensure every response is visibly labelled `reference`.
- [ ] Verify live production configuration does not rely on these routes.

### Task 5: Documentation and acceptance evidence

**Files:**
- Create: `docs/operations/reference-cpps.md`
- Modify: `docs/API_INTEGRATION.md`
- Modify: `docs/OWC_TASK_STATUS.md`

- [ ] Document assumptions, lifecycle, endpoints, safety boundary and live-migration procedure.
- [ ] Mark live CPPS discovery as no longer blocking development but still required for production acceptance.
- [ ] Run exact-head tests, type-check, lint/build and Drupal clean-room CI.
- [ ] Open a draft PR stacked on the production-infrastructure branch.
