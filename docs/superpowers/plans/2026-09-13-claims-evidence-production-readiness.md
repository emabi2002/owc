# Claims Evidence Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden OWC claim evidence, malware-scanning readiness, notification delivery bookkeeping, and operational readiness for production configuration without provisioning external services.

**Architecture:** Extend the existing evidence metadata and notification outbox rather than creating parallel subsystems. Production readiness is evaluated centrally from server-only configuration and fails closed for evidence security controls when policy requires them.

**Tech Stack:** Next.js, TypeScript, Bun test, Supabase/PostgreSQL SQL, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-13-claims-evidence-production-readiness-design.md`

## Global Constraints
- CPPS remains authoritative and is not modified by this work package.
- Restricted evidence remains outside Drupal in private storage.
- Do not provision or alter any connected Supabase project from this branch.
- No browser-visible service-role, scanner, notification-provider, or signing secrets.
- When `OWC_REQUIRE_MALWARE_SCAN=true`, evidence readiness must fail closed unless a scanner endpoint is configured.
- External services must not be represented as live until verified.

---

### Task 1: Production evidence readiness policy

**Files:**
- Modify: `src/lib/operations/readiness.ts`
- Modify: `src/lib/operations/readiness.test.ts`
- Modify: `src/lib/env.ts`

**Interfaces:**
- Consumes: existing Supabase/Drupal/CPPS/scanner/notification environment configuration.
- Produces: readiness checks for `evidenceRepository` and evidence security configuration in addition to existing dependencies.

- [ ] **Step 1: Write the failing test**

Add a test proving evidence readiness is `configuration-required` when privileged storage is available but the signing secret is weak/missing, and proving required malware scanning is not ready without a scanner endpoint.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/operations/readiness.test.ts`
Expected: FAIL because the current readiness input/model has no evidence-signing policy.

- [ ] **Step 3: Write minimal implementation**

Add a pure evidence-readiness input to `buildReadinessChecks` and derive it in `getOperationalReadiness()` from server-only configuration. Keep external dependencies visible rather than pretending they are live.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/operations/readiness.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat(operations): enforce evidence production readiness`

### Task 2: Evidence retention and scan metadata contract

**Files:**
- Modify: `src/lib/db/claims-evidence.sql`
- Modify: `src/lib/claims/evidence.ts`
- Test: `src/lib/claims/evidence-retention.test.ts`

**Interfaces:**
- Consumes: existing `claim_evidence` audit metadata and private storage path.
- Produces: optional `retentionUntil`, `legalHold`, and `securityScan` fields in the application model and corresponding SQL columns/indexes.

- [ ] **Step 1: Write the failing test**

Create a contract test that loads the SQL baseline and asserts the retention/legal-hold/security-scan controls are represented in the production schema contract.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/claims/evidence-retention.test.ts`
Expected: FAIL because current SQL lacks those columns.

- [ ] **Step 3: Write minimal implementation**

Extend `claim_evidence` with nullable `retention_until`, non-null `legal_hold default false`, and `security_scan_status` constrained to `clean`, `infected`, `unavailable`, `not_configured`; map them in `ClaimEvidence` without introducing automatic deletion.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/claims/evidence-retention.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat(evidence): add retention and scan governance metadata`

### Task 3: Notification retry audit state

**Files:**
- Modify: `src/lib/db/claim-notifications.sql`
- Modify: `src/lib/claims/notification-delivery.ts`
- Modify: `src/lib/claims/notification-delivery.test.ts`

**Interfaces:**
- Consumes: existing email/SMS gateway abstraction and notification outbox rows.
- Produces: retry decision helper plus persistent `attempt_count` and `next_attempt_at` fields for an operations worker.

- [ ] **Step 1: Write the failing test**

Add tests proving sent/suppressed notifications are terminal and failed/queued notifications can be retried subject to attempt count.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/claims/notification-delivery.test.ts`
Expected: FAIL because retry policy does not yet exist.

- [ ] **Step 3: Write minimal implementation**

Add `shouldRetryNotification(status, attemptCount, maxAttempts = 3)` and persist `attempt_count` plus `next_attempt_at` in SQL. Do not add a scheduler.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/claims/notification-delivery.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat(notifications): add auditable retry policy`

### Task 4: Full verification and operations documentation

**Files:**
- Create: `docs/operations/claims-evidence-production-readiness.md`
- Modify: `docs/superpowers/plans/2026-09-13-claims-evidence-production-readiness.md`

**Interfaces:**
- Consumes: Tasks 1-3.
- Produces: deployment checklist that explicitly identifies external configuration still required.

- [ ] **Step 1: Run focused tests**

Run: `bun test src/lib/operations/readiness.test.ts src/lib/claims/evidence-retention.test.ts src/lib/claims/notification-delivery.test.ts`
Expected: PASS.

- [ ] **Step 2: Run complete verification**

Run: `bun test && bun run lint && bun run typecheck && bun run build`
Expected: all commands PASS.

- [ ] **Step 3: Document production prerequisites**

Document private bucket/table provisioning, signing secret, scanner, notification gateway, CPPS/IdP external dependencies, backup/retention decisions, and validation commands without embedding credentials.

- [ ] **Step 4: Review branch diff**

Verify no secret values, no change to CPPS authority, no anonymous storage access, and no claim of live external connectivity.

- [ ] **Step 5: Open draft PR**

Open only after CI is green on the exact branch head.