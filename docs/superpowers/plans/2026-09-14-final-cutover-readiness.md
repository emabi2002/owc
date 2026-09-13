# OWC Final Cutover Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fail-closed, evidence-based OWC production cutover readiness package without performing or authorizing production cutover.

**Architecture:** Add a pure TypeScript GO/NO-GO evaluator over a machine-readable decision register, plus an operator CLI that only evaluates evidence. Pair it with versioned cutover, smoke-test, rollback/reconciliation and sign-off runbooks. Reuse existing release, recovery, security, UAT and operations controls rather than duplicating deployment logic.

**Tech Stack:** TypeScript, Bun tests/runtime, JSON evidence, Markdown, existing GitHub Actions CI.

**Spec:** `docs/superpowers/specs/2026-09-14-final-cutover-readiness-design.md`

## Global Constraints

- No script in this package deploys, merges, changes DNS, rotates production credentials, modifies production data or invokes real transactions.
- Missing/blocked/unverified required evidence must return `NO-GO`.
- `NOT_APPLICABLE` requires an authorized scope-decision reference.
- `ACCEPTED` requires an owner and evidence reference.
- Production authorization is a distinct explicit gate and cannot be inferred.
- Reference UAT cannot satisfy required `LIVE UAT`/agency acceptance.
- No merge/deployment to `main`.

---

### Task 1: Cutover readiness contract

**Files:**
- Create: `src/lib/operations/cutover-readiness.test.ts`

**Interfaces:**
- Consumes: cutover readiness module and repository cutover documents.
- Produces: CI-enforced required-gate/evidence/fail-closed contract.

- [ ] Write failing tests requiring all 15 gate IDs from the design.
- [ ] Require `ACCEPTED`, `NOT_READY`, `BLOCKED`, `NOT_APPLICABLE` statuses.
- [ ] Require missing/duplicate/blocked/not-ready gates to return `NO-GO`.
- [ ] Require accepted gates to have owner + evidence references.
- [ ] Require not-applicable gates to have scope-decision references.
- [ ] Require production authorization to have its own authorization reference.
- [ ] Require the CLI/template/runbooks listed by the design.
- [ ] Confirm RED while all existing OWC tests remain green.

### Task 2: GO/NO-GO evaluator

**Files:**
- Create: `src/lib/operations/cutover-readiness.ts`
- Create: `src/lib/operations/cutover-readiness.behavior.test.ts`

**Interfaces:**
- Produces: `evaluateCutoverReadiness(input: CutoverReadinessInput): CutoverReadinessResult` and `REQUIRED_CUTOVER_GATES`.

- [ ] Define typed gate IDs/statuses/input/result/blocker records.
- [ ] Implement complete-gate and duplicate-gate validation.
- [ ] Enforce evidence + owner on `ACCEPTED`.
- [ ] Enforce scope-decision reference on `NOT_APPLICABLE`.
- [ ] Enforce explicit production authorization reference.
- [ ] Return only `GO` or `NO-GO` plus deterministic blocking reasons; never perform side effects.
- [ ] Add behavior tests for complete GO, missing gate, blocked/not-ready, missing evidence/owner, invalid N/A and missing production authorization.

### Task 3: Operator evaluator CLI and evidence template

**Files:**
- Create: `scripts/cutover/evaluate-readiness.ts`
- Create: `docs/cutover/cutover-readiness-template.json`
- Modify: `package.json`

**Interfaces:**
- Produces: `bun run cutover:readiness` using `OWC_CUTOVER_EVIDENCE_FILE` or a supplied path.

- [ ] CLI reads JSON only from an operator-specified/local evidence file.
- [ ] CLI never reads/prints production secrets or contacts live services.
- [ ] Print release/environment, GO/NO-GO and blocker summaries.
- [ ] Exit non-zero for invalid input or `NO-GO`.
- [ ] Template includes every required gate as `NOT_READY` with blank evidence/ownership fields and therefore evaluates `NO-GO` by default.

### Task 4: Cutover runbooks and evidence governance

**Files:**
- Create: `docs/cutover/cutover-evidence-register.md`
- Create: `docs/cutover/final-cutover-runbook.md`
- Create: `docs/cutover/rollback-reconciliation.md`
- Create: `docs/cutover/cutover-smoke-checklist.md`
- Create: `docs/cutover/cutover-signoff-template.md`

**Interfaces:**
- Consumes: release, backup/DR, security, UAT, operations and integration controls.
- Produces: operator-controlled final migration/cutover/rollback/evidence/sign-off package.

- [ ] Define pre-freeze roles/change window/comms and release SHA evidence.
- [ ] Define backup/restore checkpoint and rollback owners.
- [ ] Define final database/Drupal/configuration migration/reconciliation sequence.
- [ ] Define application/DNS/TLS routing sequence as operator-controlled actions, not executable automation.
- [ ] Define public/auth/Drupal/claims/evidence/notifications/CPPS/integration/monitoring smoke tests.
- [ ] Define rollback boundaries for app code vs DB/Drupal/storage/CPPS/external transactions.
- [ ] Define stabilization, incident and final sign-off evidence.

### Task 5: External-gate/status reconciliation

**Files:**
- Modify: `docs/OWC_TASK_STATUS.md`
- Create: `docs/verification/final-cutover-readiness-tdd.md`
- Update/comment: GitHub issue #8 after exact-head verification.

**Interfaces:**
- Produces: Task 16 repository-readiness status while keeping actual production go-live external.

- [ ] Mark Task 16 `COMPLETED (repository) / PRODUCTION CUTOVER EXTERNAL` only after package verification.
- [ ] Preserve task 4–10 live activation and formal UAT/security/operations gates as external.
- [ ] Record RED evidence and the non-deployment boundary.
- [ ] After verification, link PR/runbook package into issue #8 without checking off unverified external items.

### Task 6: CI and exact-head verification

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: exact-head evidence and stacked draft PR.

- [ ] Add `feature/final-cutover-readiness` to the CI allow-list.
- [ ] Do not run the default `NOT_READY` cutover template as a success gate; unit tests validate evaluator behavior instead.
- [ ] Run existing repository security assurance, tests and reference UAT.
- [ ] Verify UAT artifact upload, lint/type-check, build and Drupal clean-room.
- [ ] Confirm production SSH deploy remains skipped.
- [ ] Open draft PR stacked on `feature/end-to-end-uat-readiness`.
