# OWC Master Task Status — 13 September 2026

This file reconciles the agreed OWC task list against repository evidence. It distinguishes repository/reference implementation from external production activation so that configuration, synthetic services or successful UAT scaffolding are not mistaken for live government integrations.

## Status legend

- **COMPLETED (repository)** — implemented and CI-verifiable in the repository; production activation may still require infrastructure or formal acceptance.
- **REFERENCE COMPLETE / LIVE EXTERNAL** — a realistic synthetic/reference implementation and stable contract exist, allowing development and UAT to proceed; the authoritative live system still requires discovery, mapping and acceptance.
- **PARTIAL / EXTERNAL ACTIVATION** — repository controls exist, but real service, credentials, hosting, data or formal acceptance is still required.
- **NOT YET COMPLETE** — further repository or operational work remains.
- **OPEN SOURCE GAP** — required source material has not yet been located/supplied.

## Reconciled task list

| # | Task | Status | Current position / remaining work |
|---|---|---|---|
| 1 | Drupal implementation | **COMPLETED (repository)** | Drupal 11/PostgreSQL stack, eight editorial content types, JSON:API, media, moderation workflow, roles/permissions, deterministic bootstrap and clean-room CI are implemented. Real OWC DEV/UAT/PROD hosting remains an infrastructure activation action. |
| 2 | Migrate existing CMS content model to Drupal | **COMPLETED (repository)** | Deterministic export/import, all eight bundle mappings, idempotent upsert, workflow-state preservation and source-to-Drupal parity verification are implemented. Production data reconciliation on the approved source dataset remains a cutover action. |
| 3 | Drupal ↔ Next.js integration | **COMPLETED (repository)** | Drupal is supported as the authoritative public-content source behind the Next.js server content boundary. Explicit rollback/transitional modes remain available; no silent fallback occurs in Drupal-authoritative mode. |
| 4 | Identity integration | **PARTIAL / EXTERNAL ACTIVATION** | OIDC editor SSO, IdP-MFA boundary, group-to-role mapping, local-login enforcement, break-glass recovery and identity audit controls are implemented and CI-verified. Real OWC/agency IdP registration, client credentials, MFA users/groups and UAT are still required. |
| 5 | Live CPPS discovery | **REFERENCE COMPLETE / LIVE EXTERNAL** | Development is no longer blocked: a realistic synthetic CPPS reference model now defines claim registration, lifecycle, assessment, decision, payment scheduling/payment, employer verification and receipt behavior. Real CPPS remains authoritative; OWC must still supply documentation/access covering platform, schema/API, authentication, environments, ownership and approved UAT data before production acceptance. |
| 6 | CPPS production adapter | **REFERENCE COMPLETE / LIVE EXTERNAL** | `src/lib/cpps/api.ts` now provides a stable OWC boundary with deterministic backend selection: configured live CPPS first, explicitly enabled reference CPPS second, otherwise fail closed. Random/mock success behavior has been removed. Reference claim/status mapping and controlled UAT HTTP endpoints are implemented. Authoritative live field/state/auth mapping and CPPS UAT remain external acceptance work. |
| 7 | Production evidence repository | **PARTIAL / EXTERNAL ACTIVATION** | Claim-scoped signed upload grants, private-storage pathway, SHA-256/metadata, retention date, legal hold and scan-state controls are implemented. Actual OWC production Supabase/private bucket, retention approval, backup and storage acceptance are still required. |
| 8 | Malware/security scanning | **PARTIAL / EXTERNAL ACTIVATION** | Fail-closed scanner policy and production-readiness controls are implemented. A real approved scanning endpoint/provider, credentials and DEV/UAT verification are still required. |
| 9 | Email/SMS notifications | **PARTIAL / EXTERNAL ACTIVATION** | Server-side notification gateway abstraction, outbox/audit model, retry bookkeeping and lifecycle delivery pathway are implemented. Actual provider endpoint/credentials, scheduler/operations worker where required, message-template acceptance and delivery UAT remain. |
| 10 | External government integrations | **PARTIAL / EXTERNAL ACTIVATION** | Production-safe Integration Hub foundation is implemented for NID/identity, employer registry, insurance, payments and medical providers, while a coherent synthetic integration sandbox supports development/demo flows. Real agency endpoints, authoritative schemas, authentication, networking and agency UAT are still required. |
| 11 | Production infrastructure | **COMPLETED (repository)** | Ubuntu/PM2/Nginx deployment baseline, health-checked release script, application-code rollback, deployment preflight, monitoring script/runbook and CI validation are implemented. Exact infrastructure head `adf407ef655e3939d29c2633e6e7425da3c7bcd1` completed full CI including Drupal clean-room. Draft PR #9 preserves this work. Actual host/DNS/TLS/secrets and live environment acceptance remain external provisioning/cutover actions. |
| 12 | Backup and disaster recovery | **NOT YET COMPLETE** | Architecture requires automated database/Drupal/document/configuration backups, off-host/logically separate copy, restore evidence and approved RPO/RTO. This is the next major repository package; real provider retention, PITR/offsite storage and restore rehearsal will still require an approved OWC environment. |
| 13 | Security assessment | **PARTIAL / EXTERNAL ACTIVATION** | Secure coding controls, CI tests, security headers, RBAC/RLS boundaries, fail-closed integration behavior and security checklists exist. Independent OWASP/vulnerability/penetration testing and formal production security sign-off remain. |
| 14 | Full end-to-end UAT | **NOT YET COMPLETE** | The reference ecosystem now allows synthetic end-to-end development/UAT without waiting for every real agency system. Formal production-like UAT still requires approved Drupal/Supabase, CPPS/agency UAT contracts, scanner/notification services and business/security sign-off. |
| 15 | Operational administration and SLA | **PARTIAL** | Health/readiness models, monitoring baseline and operations runbooks exist. Formal incident ownership, escalation matrix, SLA targets, patch cadence, Tier-3 procedures, service reporting and 12-month support operating model still need completion/acceptance. |
| 16 | Final deployment and cutover | **NOT YET COMPLETE** | Depends on recovery, operations, security, UAT and live-environment acceptance. Production DNS/SSL/hosting, credentials, final content/data migration, smoke tests, rollback readiness and formal go-live approval remain. |
| 17 | RFI/articles reconciliation | **OPEN SOURCE GAP** | OWC Terms of Reference and September 2026 RFQ are located. A separately identifiable OWC RFI and the referenced recent published articles/write-ups are still not located and must be reconciled when found/supplied. |

## Current execution order

1. Close the reference CPPS package with exact-head CI and preserve it as a stacked draft PR; real CPPS discovery remains a later live-acceptance mapping exercise.
2. Complete backup/DR repository controls and restore-runbook framework (task 12), while leaving real offsite retention/PITR and restore rehearsal for the approved OWC environment.
3. Complete operational administration/SLA artifacts and monitoring/incident controls that do not require live infrastructure (task 15).
4. Strengthen security automation/evidence and prepare the external security-assessment evidence pack (task 13).
5. Extend synthetic end-to-end UAT across the reference ecosystem, then execute formal production-like UAT when live UAT services become available (task 14).
6. Map and contract-test the reference CPPS/external-service contracts against authoritative live APIs as agencies/OWC provide them (tasks 4–10).
7. Execute final production cutover only after backup/recovery, security, UAT and operational acceptance gates are satisfied (task 16).
8. Reconcile the outstanding RFI/articles source gap when those materials are located (task 17).

## Governing rule

A repository feature, configured endpoint, reference application or sandbox adapter is not evidence that an external/internal service is live. Reference services may be used to complete realistic workflows and synthetic UAT, but production status requires the actual endpoint/environment, approved credentials, authoritative contract/schema, successful DEV/UAT verification and formal acceptance where applicable.
