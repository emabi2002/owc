# OWC Master Task Status — 13 September 2026

This file reconciles the agreed OWC task list against repository evidence. It distinguishes repository implementation from external production activation so that configuration or design is not mistaken for a live government integration.

## Status legend

- **COMPLETED (repository)** — implemented and verified in repository/CI; production activation may still require infrastructure.
- **PARTIAL / EXTERNAL ACTIVATION** — repository controls exist, but real service, credentials, hosting, data or formal acceptance is still required.
- **BLOCKED — EXTERNAL INPUT** — cannot be completed honestly until OWC/another agency provides authoritative access or specifications.
- **NOT YET COMPLETE** — further repository or operational work remains.

## Reconciled task list

| # | Task | Status | Current position / remaining work |
|---|---|---|---|
| 1 | Drupal implementation | **COMPLETED (repository)** | Drupal 11/PostgreSQL stack, eight editorial content types, JSON:API, media, moderation workflow, roles/permissions, deterministic bootstrap and clean-room CI are implemented. Real OWC DEV/UAT/PROD hosting remains an infrastructure action. |
| 2 | Migrate existing CMS content model to Drupal | **COMPLETED (repository)** | Deterministic export/import, all eight bundle mappings, idempotent upsert, workflow-state preservation and source-to-Drupal parity verification are implemented. Production data reconciliation on the approved source dataset remains a cutover action. |
| 3 | Drupal ↔ Next.js integration | **COMPLETED (repository)** | Drupal is supported as the authoritative public-content source behind the Next.js server content boundary. Explicit rollback/transitional modes remain available; no silent fallback occurs in Drupal-authoritative mode. |
| 4 | Identity integration | **PARTIAL / EXTERNAL ACTIVATION** | OIDC editor SSO, IdP-MFA boundary, group-to-role mapping, local-login enforcement, break-glass recovery and identity audit controls are implemented and CI-verified. Real OWC/agency IdP registration, client credentials, MFA users/groups and UAT are still required. |
| 5 | Live CPPS discovery | **BLOCKED — EXTERNAL INPUT** | CPPS remains authoritative. OWC must provide read-only documentation/access covering platform, schema, APIs, authentication, environments, ownership and sample/UAT data. No production claim should be made before this discovery. |
| 6 | CPPS production adapter | **BLOCKED — EXTERNAL INPUT** | Generic/transitional CPPS boundaries exist, but authoritative production field mapping cannot be completed before task 5. Required mapping includes claim reference/status, claimant/employer, workflow events, payment status and other approved fields. |
| 7 | Production evidence repository | **PARTIAL / EXTERNAL ACTIVATION** | Claim-scoped signed upload grants, private-storage pathway, SHA-256/metadata, retention date, legal hold and scan-state controls are implemented. Actual OWC production Supabase/private bucket, retention approval, backup and storage acceptance are still required. |
| 8 | Malware/security scanning | **PARTIAL / EXTERNAL ACTIVATION** | Fail-closed scanner policy and production-readiness controls are implemented. A real approved scanning endpoint/provider, credentials and DEV/UAT verification are still required. |
| 9 | Email/SMS notifications | **PARTIAL / EXTERNAL ACTIVATION** | Server-side notification gateway abstraction, outbox/audit model, retry bookkeeping and lifecycle delivery pathway are implemented. Actual provider endpoint/credentials, scheduler/operations worker where required, message-template acceptance and delivery UAT remain. |
| 10 | External government integrations | **PARTIAL / EXTERNAL ACTIVATION** | Production-safe Integration Hub foundation is implemented for NID/identity, employer registry, insurance, payments and medical providers. Real agency endpoints, authoritative schemas, authentication, networking and agency UAT are still required. |
| 11 | Production infrastructure | **IN PROGRESS** | Ubuntu 24.04 deployment guide, Nginx/TLS/UFW configuration, PM2/systemd options, Docker assets and main-branch SSH deployment workflow already exist. Current work package is hardening deployment preflight, smoke/rollback, environment acceptance, monitoring hooks and documented production verification. Actual host/DNS/TLS/secrets remain external provisioning. |
| 12 | Backup and disaster recovery | **NOT YET COMPLETE** | Architecture requires automated backups, off-host copy, restore evidence and agreed RPO/RTO. Repository documentation exists, but real backup schedules, PITR/pg_dump policy, Drupal/object-storage backup and restore rehearsal remain. |
| 13 | Security assessment | **PARTIAL / EXTERNAL ACTIVATION** | Secure coding controls, CI tests, security headers, RBAC/RLS boundaries and security checklists exist. Independent OWASP/vulnerability/penetration testing and formal production security sign-off remain. |
| 14 | Full end-to-end UAT | **NOT YET COMPLETE** | Cannot close until production-like Drupal/Supabase, CPPS UAT access, notification/scanning services and approved external interfaces are available. Full worker → evidence → CPPS → officer → notification → decision/payment → closure flow remains to be executed and signed off. |
| 15 | Operational administration and SLA | **PARTIAL** | Health/readiness models and operations runbooks exist. Formal monitoring/alerting, incident ownership, escalation matrix, patch cadence, Tier-3 procedures, service reporting and 12-month SLA operating model still need completion/acceptance. |
| 16 | Final deployment and cutover | **NOT YET COMPLETE** | Depends on tasks 5–15. Production DNS/SSL/hosting, credentials, final content/data migration, smoke tests, rollback readiness and formal go-live approval remain. |
| 17 | RFI/articles reconciliation | **OPEN SOURCE GAP** | OWC Terms of Reference and September 2026 RFQ are now located. A separately identifiable OWC RFI and the referenced recent published articles/write-ups are still not located and must be reconciled when found/supplied. |

## Current execution order

1. Complete repository-side production infrastructure hardening (task 11).
2. Complete backup/DR repository controls and restore-runbook framework (task 12), while awaiting the real hosting/database environment for a restore rehearsal.
3. Complete operational administration/SLA artifacts and monitoring/incident controls that do not require live infrastructure (task 15).
4. Revisit security automation and prepare the external security-assessment evidence pack (task 13).
5. Execute CPPS discovery immediately when authoritative access/documentation is supplied (task 5), then implement the real CPPS production adapter (task 6).
6. Configure and UAT the real evidence scanner, notification gateway and government connectors as endpoints/contracts become available (tasks 7–10).
7. Execute full E2E UAT and production cutover only after the above gates are satisfied (tasks 14 and 16).

## Governing rule

A repository feature, configuration field or mock/sandbox adapter is not evidence that an external service is live. Production status requires the real endpoint/environment, approved credentials, authoritative contract/schema, successful DEV/UAT verification and formal acceptance where applicable.
