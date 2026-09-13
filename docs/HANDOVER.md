# Handover Document — OWC PNG Digital Service

This document summarizes the repository implementation and the controls required for an OWC team to take operational ownership. Repository completeness is **not** the same as production activation: live hosting, credentials, external integrations, UAT, security acceptance and go-live approval remain separate gates.

## 1. What this is

The OWC solution is a layered digital service built around:

- **Next.js 15** public portal and application/API layer;
- **Drupal 11** enterprise CMS and editorial workflow;
- **Supabase/PostgreSQL** application data, authentication/audit and claims-support storage pathways;
- a stable **CPPS integration boundary**, with a realistic reference CPPS available only for explicit development/UAT use;
- evidence, notification, security, integration, monitoring and recovery controls designed to fail closed when production dependencies are absent.

The real CPPS remains authoritative for production claims/payment state. The application no longer fabricates successful CPPS responses when neither live nor explicitly enabled reference CPPS is available.

## 2. Repository and technology

- Repository: `https://github.com/emabi2002/owc.git`
- Application: Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui, Zod, Bun
- Data/Auth: Supabase/PostgreSQL
- CMS: Drupal 11/PostgreSQL, JSON:API, moderation workflow, OIDC identity foundation
- Operations: Nginx, PM2/systemd options, GitHub Actions, health/preflight/monitoring, backup/DR tooling

## 3. Key paths

```text
src/app/                       Public/admin UI and route handlers
src/lib/cpps/                  Live/reference CPPS boundary
src/lib/integrations/          Synthetic and production Integration Hub controls
src/lib/claims/                Claims, evidence, scanning and notification controls
src/lib/security/              Validation, CAPTCHA, rate limiting and security helpers
src/lib/operations/            Health/readiness/monitoring/recovery/operating tests
src/lib/drupal/                Drupal client, migration and identity contracts
drupal/                        Drupal image, config, scripts and isolated stack
deploy/                        Nginx, service, release, monitoring and backup/DR scripts
docs/operations/               Operational runbooks and evidence templates
docs/verification/             TDD/verification evidence
```

## 4. Environment and secrets

Production secrets are runtime-only and must be stored in the approved host/secret manager. Do not commit service-role keys, CPPS credentials, OIDC secrets, evidence-signing secrets, scanner/notification credentials or external-agency credentials.

Configuration being present does not prove a dependency is production-accepted. The authenticated System Readiness/preflight model separates configured components from external verification requirements.

## 5. CMS and content

Drupal provides the enterprise editorial CMS foundation, including content types, media, moderation states and OWC roles. Migration/export/import/parity controls support deterministic reconstruction. Next.js can use Drupal as the authoritative public-content source with fail-closed behavior in Drupal-authoritative mode.

Production content migration still requires the approved source dataset and cutover reconciliation.

## 6. Identity and access

The repository implements application RBAC controls and Drupal OIDC/SSO foundations, including group-to-role mapping, MFA-at-IdP boundary, local-login enforcement and break-glass recovery. Production acceptance requires the actual OWC/agency identity provider, approved client registration, users/groups and UAT.

## 7. Claims, evidence and CPPS

OWC claim lodgement/tracking uses the stable CPPS boundary. Backend selection is:

1. configured live CPPS;
2. explicitly enabled reference CPPS for development/UAT;
3. fail closed.

The reference CPPS is synthetic, process-local and non-production. It supports realistic claim lifecycle testing but does not move real funds or replace live CPPS discovery/UAT.

Evidence controls include claim-scoped upload grants, private-storage pathways, metadata/checksum, retention/legal-hold and fail-closed malware-scanning policy. Actual production storage/scanner/provider activation remains external.

## 8. External integrations and notifications

The production Integration Hub defines safe connector boundaries for identity/NID, employer registry, insurance, payments and medical-provider services. Real endpoints, schemas, authentication, networking and agency acceptance remain required.

Notifications use a server-side gateway/outbox/retry model. Production provider credentials, delivery operations and template/delivery UAT remain required.

## 9. Deployment, monitoring and recovery

- Deployment guide: `docs/DEPLOYMENT_UBUNTU_24_04.md`
- Monitoring: `docs/operations/production-monitoring.md`
- Backup/DR: `docs/operations/backup-disaster-recovery.md`
- Incident management: `docs/operations/incident-management.md`
- SLA/Tier-3 support: `docs/operations/support-sla.md`
- Maintenance: `docs/operations/maintenance-and-patching.md`
- Runbook index: `docs/operations/runbook-index.md`

The versioned release script performs application health checking and application-code rollback. Backup/DR tooling creates integrity-checked recovery artifacts and deliberately restricts repository restore scripts to confirmed non-production rehearsals. Production PITR, off-host retention, RPO/RTO and restore acceptance remain external gates.

## 10. Operational ownership and support

OWC must assign named owners for the Service Owner, Operations Coordinator, Tier-1/Tier-2, Application/Tier-3 Engineering, Infrastructure, Database/Storage, CMS, Identity/Security and CPPS/Integration functions.

The required operating model includes **12-month Tier-3 support**, but binding service hours and acknowledgement/response/restoration/resolution targets remain `UNAPPROVED` until formally accepted. Support ownership must be recorded in the OWC service register; no third-party placeholder support address is authoritative.

## 11. Production go-live gates

Before production go-live, obtain evidence for at least:

- approved host/DNS/TLS/network and secret storage;
- authoritative OWC database/storage and production schema verification;
- real Drupal hosting/content/identity acceptance;
- real CPPS and agency endpoint/contract/UAT acceptance;
- scanner and notification-provider UAT;
- monitoring/alert routing and named operational ownership;
- approved SLA/support arrangements;
- approved RPO/RTO, backups/off-host copy and restore rehearsal;
- formal security assessment and remediation;
- end-to-end production-like UAT and business/security sign-off;
- approved cutover, smoke, rollback/reconciliation and go-live authority.

The master reconciliation is maintained in `docs/OWC_TASK_STATUS.md`, and unresolved external cutover gates are tracked in GitHub issue #8.
