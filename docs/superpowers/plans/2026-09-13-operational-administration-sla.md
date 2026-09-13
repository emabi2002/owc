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

- [x] Write failing tests requiring `operating-model.md`, `incident-management.md`, `support-sla.md`, `maintenance-and-patching.md`, `service-report-template.md` and `runbook-index.md`.
- [x] Require role ownership, S1–S4 severity, incident lifecycle, `12-month`, `Tier-3`, `UNAPPROVED`, backup/security/change/reporting coverage, and no fabricated numeric SLA targets.
- [x] Confirm RED in CI run `34759940286`: 141 existing tests passed; only six new document-contract tests failed.
- [x] Commit the RED contract.

### Task 2: Operating model and incident management

- [x] Define Service Owner, Operations Coordinator, Tier-1/Tier-2, Tier-3 Engineering, Infrastructure, Database/Storage, CMS, Identity/Security and CPPS/Integration roles.
- [x] Define S1–S4 severity using impact criteria rather than numeric response promises.
- [x] Define `Detected → Logged → Triaged → Assigned → Investigating → Mitigated/Restored → Resolved → Validated → Closed`.
- [x] Define incident evidence, communications, escalation, post-incident review and privacy requirements.

### Task 3: SLA and 12-month Tier-3 support

- [x] Define Tier-1, Tier-2 and Tier-3 responsibilities and handoff criteria.
- [x] Define acknowledgement, response, restoration/workaround and resolution/action-plan metrics for S1–S4.
- [x] Set all sixteen binding target cells to `UNAPPROVED`; no guessed minutes/hours are inserted.
- [x] Define 12-month Tier-3 scope, exclusions, knowledge transfer and reporting duties.
- [x] Add service-hours, measurement/exclusion and external-dependency approval fields.

### Task 4: Maintenance and service reporting

- [x] Define routine vs emergency change flow, pre-change checks, backup/recovery readiness, validation, rollback and post-change review.
- [x] Define patch domains: application dependencies, OS/runtime, Drupal, TLS, DB/platform and security remediation.
- [x] Require an approved maintenance calendar rather than inventing contractual patch frequency.
- [x] Build monthly report sections for availability evidence, incidents/SLA, releases, security, backups/restores, integrations, capacity, Tier-3 workload, risks/actions and next-period work.

### Task 5: Runbook governance and existing-document reconciliation

- [x] Create the runbook index covering deployment, monitoring, backup/DR, incident, SLA/support, maintenance, security/UAT/cutover governance.
- [x] Link monitoring alerts to the common incident lifecycle and approved SLA/escalation decisions.
- [x] Correct obsolete handover claims: no unconditional production-ready claim, no random/mock CPPS success claim, current Drupal/reference/recovery controls, OWC-assigned support ownership.
- [x] Mark Task 15 `COMPLETED (repository)` while preserving external operational-acceptance gates.

### Task 6: CI and acceptance evidence

- [x] Add `feature/operational-administration-sla` to the CI branch allow-list without changing production deployment behavior.
- [x] Record RED run evidence and the repository/external acceptance boundary.
- [ ] Run exact-head shell validation, Bun tests, lint/type-check, Next.js build and Drupal clean-room CI.
- [ ] Confirm Ubuntu production deployment is skipped because the branch is not `main`.
- [ ] Open a draft PR stacked on `feature/backup-disaster-recovery-readiness`.
