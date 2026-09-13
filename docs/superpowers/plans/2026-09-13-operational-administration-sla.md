# OWC Operational Administration and SLA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a repository-verifiable OWC operating model covering incident management, 12-month Tier-3 support, SLA approval, maintenance, service reporting and runbook governance without inventing binding contractual targets.

**Architecture:** Build a documentation-first operating-control package backed by contract tests. Reuse existing production monitoring, recovery, deployment and security controls; add one incident lifecycle and one support/SLA governance model rather than duplicate operational paths.

**Tech Stack:** Markdown runbooks/templates, Bun tests, TypeScript test contracts, existing GitHub Actions CI.

**Spec:** `docs/superpowers/specs/2026-09-13-operational-administration-sla-design.md`

## Global Constraints

- Repository roles are functional roles, not invented named personnel.
- Binding SLA numeric targets remain `UNAPPROVED` until formal OWC/contract acceptance.
- The required support period is 12-month Tier-3 support.
- Operational records must not contain claimant evidence, medical/bank data or secrets.
- CPPS/external-system authority remains unchanged.
- No production deployment or merge to `main`.

---

### Task 1: Operational control contract

**Files:**
- Create: `src/lib/operations/operating-model.test.ts`

**Interfaces:**
- Consumes: repository operations documentation as text contracts.
- Produces: CI-enforced requirements for roles, severity model, Tier-3 support, unapproved SLA targets, maintenance and service reporting.

- [ ] Write failing tests requiring `operating-model.md`, `incident-management.md`, `support-sla.md`, `maintenance-and-patching.md`, `service-report-template.md` and `runbook-index.md`.
- [ ] Require role ownership, S1–S4 severity, incident lifecycle, `12-month`, `Tier-3`, `UNAPPROVED`, backup/security/change/reporting coverage, and no fabricated numeric SLA targets.
- [ ] Run CI and confirm RED because the new operating documents do not yet exist.
- [ ] Commit the RED contract.

### Task 2: Operating model and incident management

**Files:**
- Create: `docs/operations/operating-model.md`
- Create: `docs/operations/incident-management.md`

**Interfaces:**
- Consumes: existing production monitoring, deployment and backup/DR runbooks.
- Produces: functional ownership model and a common incident lifecycle used by all operational disciplines.

- [ ] Define Service Owner, Operations Coordinator, Tier-1/Tier-2, Tier-3 Engineering, Infrastructure, Database/Storage, CMS, Identity/Security and CPPS/Integration roles.
- [ ] Define S1–S4 severity using impact criteria rather than numeric response promises.
- [ ] Define `Detected → Logged → Triaged → Assigned → Investigating → Mitigated/Restored → Resolved → Validated → Closed`.
- [ ] Define incident evidence, communications, escalation, post-incident review and privacy requirements.
- [ ] Run the operating-model tests and verify these requirements turn GREEN.

### Task 3: SLA and 12-month Tier-3 support

**Files:**
- Create: `docs/operations/support-sla.md`

**Interfaces:**
- Consumes: severity model from incident management.
- Produces: support-level boundaries, SLA decision table and 12-month Tier-3 engineering scope.

- [ ] Define Tier-1, Tier-2 and Tier-3 responsibilities and handoff criteria.
- [ ] Define acknowledgement, response, restoration/workaround and resolution/action-plan metrics for S1–S4.
- [ ] Set every numeric target to `UNAPPROVED` until formal OWC/contract acceptance; do not insert guessed minutes/hours.
- [ ] Define 12-month Tier-3 scope, exclusions, knowledge transfer and reporting duties.
- [ ] Add service-hours, measurement/exclusion and external-dependency decision fields for later approval.
- [ ] Run tests and verify the SLA contract is GREEN.

### Task 4: Maintenance and service reporting

**Files:**
- Create: `docs/operations/maintenance-and-patching.md`
- Create: `docs/operations/service-report-template.md`

**Interfaces:**
- Consumes: release, backup/DR, monitoring and security controls.
- Produces: controlled maintenance process and repeatable monthly service evidence.

- [ ] Define routine vs emergency change flow, pre-change checks, backup/recovery readiness, validation, rollback and post-change review.
- [ ] Define patch domains: application dependencies, OS/runtime, Drupal, TLS, DB/platform and security remediation.
- [ ] Do not invent a contractual patch frequency; require an approved maintenance calendar.
- [ ] Build monthly report sections for availability evidence, incidents/SLA, releases, security, backups/restores, integrations, capacity, Tier-3 workload, risks/actions and next-period work.
- [ ] Run tests and verify maintenance/reporting requirements are GREEN.

### Task 5: Runbook governance and existing-document reconciliation

**Files:**
- Create: `docs/operations/runbook-index.md`
- Modify: `docs/operations/production-monitoring.md`
- Modify: `docs/HANDOVER.md`
- Modify: `docs/OWC_TASK_STATUS.md`

**Interfaces:**
- Consumes: all current operations runbooks.
- Produces: authoritative navigation/ownership index and current handover/status language.

- [ ] Index deployment, monitoring, backup/DR, incident, SLA/support, maintenance, security/UAT/cutover references with ownership and acceptance state.
- [ ] Link monitoring alerts to the common incident lifecycle and approved escalation targets.
- [ ] Correct obsolete handover claims: remove unconditional “production-ready” wording, remove mock-CPPS wording, reference Drupal/reference CPPS/recovery controls, and replace third-party placeholder support ownership with OWC-assigned roles.
- [ ] Mark Task 15 `COMPLETED (repository)` while preserving external operational-acceptance gates.
- [ ] Run tests and inspect documentation consistency.

### Task 6: CI and acceptance evidence

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `docs/verification/operational-administration-sla-tdd.md`

**Interfaces:**
- Consumes: branch implementation and operating-model tests.
- Produces: exact-head CI evidence and stacked draft PR.

- [ ] Add `feature/operational-administration-sla` to the CI branch allow-list only; do not add any production deployment behavior.
- [ ] Record RED run evidence and the repository/external acceptance boundary.
- [ ] Run exact-head shell validation, Bun tests, lint/type-check, Next.js build and Drupal clean-room CI.
- [ ] Confirm Ubuntu production deployment is skipped because the branch is not `main`.
- [ ] Open a draft PR stacked on `feature/backup-disaster-recovery-readiness`.
