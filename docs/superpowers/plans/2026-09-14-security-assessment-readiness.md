# OWC Security Assessment Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden OWC authorization/security configuration and build a repository-verifiable evidence package for an independent production security assessment.

**Architecture:** Keep security enforcement at the authoritative boundaries: PostgreSQL/RLS for profile privilege and account status, Nginx for production edge CSP, and CI for non-destructive repository assurance. Use OWASP Top 10:2025 for risk-awareness mapping and ASVS 5.0.0 for assessor evidence references, while preserving independent testing and production sign-off as external gates.

**Tech Stack:** PostgreSQL/Supabase RLS and triggers, Nginx, Bash, Bun tests, TypeScript, Markdown, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-security-assessment-readiness-design.md`

## Global Constraints

- Do not run penetration testing or destructive testing from CI.
- Do not expose environment variables, credentials, claimant evidence, medical data or banking data.
- Suspended/invited profiles must not retain staff privileges through stored roles.
- Non-administrator self-service profile updates must not change privileged identity/authorization fields.
- Production CSP must not contain `unsafe-eval`.
- Do not claim blanket ASVS compliance or production security acceptance.
- No merge/deployment to `main`.

---

### Task 1: Security hardening contract

**Files:**
- Create: `src/lib/security/security-assessment.test.ts`

**Interfaces:**
- Consumes: `src/lib/db/schema.sql`, `deploy/nginx.conf`, security docs and assurance script.
- Produces: CI-enforced invariants for active-account authorization, profile privilege protection, CSP hardening and assessment evidence.

- [ ] Write failing tests that require `current_app_role()` and `is_staff()` to enforce `status = 'active'`.
- [ ] Require a profile privileged-field protection trigger/function covering `email`, `role`, `status` and `mfa_enabled`.
- [ ] Require production Nginx CSP to exclude `unsafe-eval`.
- [ ] Require `scripts/security/repository-assurance.sh` and the four assessment-governance documents.
- [ ] Require OWASP Top 10:2025 and ASVS 5.0.0 terminology without a blanket-compliance claim.
- [ ] Run CI and confirm RED only on the newly required Task 13 controls.

### Task 2: Database authorization hardening

**Files:**
- Modify: `src/lib/db/schema.sql`
- Create: `src/lib/db/security-hardening-2026-09-14.sql`

**Interfaces:**
- Produces: active-status-aware `current_app_role()` / `is_staff()` and `protect_profile_privileged_fields()` trigger contract.

- [ ] Update `current_app_role()` to return the stored role only when the matching profile is `active`, otherwise `viewer`.
- [ ] Update `is_staff()` to require an active matching profile.
- [ ] Add an idempotent `protect_profile_privileged_fields()` BEFORE UPDATE trigger on `profiles` that blocks non-admin self-escalation of `email`, `role`, `status` or `mfa_enabled`.
- [ ] Add the same changes to the standalone hardening SQL for already-provisioned environments.
- [ ] Run the security contract and verify the database assertions pass.

### Task 3: Edge CSP and repository assurance

**Files:**
- Modify: `deploy/nginx.conf`
- Create: `scripts/security/repository-assurance.sh`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: a static, credential-safe CI assurance command.

- [ ] Remove `unsafe-eval` from the production Nginx `script-src` directive.
- [ ] Implement a strict Bash assurance script that verifies the database hardening markers, CSP rule, no tracked `.env.local`, and no tracked PEM private-key files.
- [ ] Ensure the assurance script never prints environment-variable contents or secret values.
- [ ] Add the security branch to the CI branch allow-list and run the assurance script before tests.
- [ ] Keep production deployment behavior unchanged.

### Task 4: Security assessment documentation

**Files:**
- Modify: `docs/SECURITY_CHECKLIST.md`
- Create: `docs/security/security-assessment-scope.md`
- Create: `docs/security/security-assessment-evidence-template.md`
- Create: `docs/security/security-finding-register.md`
- Create: `docs/security/security-acceptance-gates.md`

**Interfaces:**
- Produces: external-assessor scope, evidence and remediation governance.

- [ ] Replace the obsolete OWASP 2021 mapping with OWASP Top 10:2025 categories and current OWC control references.
- [ ] Reference ASVS 5.0.0 as a verification basis, with exact versioned identifiers recorded only when actually assessed.
- [ ] Remove the unsupported fixed audit-retention assumption and mark retention as policy approval required.
- [ ] Define assessor scope across application/API, auth/RBAC/RLS, CMS, uploads/scanner, integrations, infrastructure, logs and recovery.
- [ ] Define evidence capture and finding/retest/acceptance fields without claimant payloads or secrets.
- [ ] Define go-live-blocking security gates and authorized risk-acceptance fields.

### Task 5: Status and verification

**Files:**
- Modify: `docs/OWC_TASK_STATUS.md`
- Create: `docs/verification/security-assessment-tdd.md`

**Interfaces:**
- Produces: reconciled Task 13 status and TDD evidence.

- [ ] Mark Task 13 `COMPLETED (repository)` only after the hardening/evidence package is implemented, while explicitly retaining independent testing/security sign-off as external.
- [ ] Record RED-run evidence and the production-acceptance boundary.
- [ ] Run exact-head static assurance, shell syntax validation, Bun tests, lint/type-check, build and Drupal clean-room reconstruction.
- [ ] Confirm production SSH deployment is skipped.
- [ ] Preserve the verified branch as a draft PR stacked on `feature/operational-administration-sla`.
