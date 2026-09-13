# OWC Maintenance and Patching Runbook

## Purpose

Define controlled maintenance for the OWC application, Drupal CMS, operating platform and supporting services without inventing a contractual patch frequency. The approved **maintenance calendar** is the authority for planned work; security risk may require accelerated emergency handling.

## Change classes

### Routine change

A **routine change** is planned, assessed and scheduled through the maintenance calendar. Examples include dependency updates, planned application releases, Drupal updates, certificate work, platform maintenance and approved configuration changes.

### Emergency change

An **emergency change** is necessary to contain or restore a material incident or remediate a time-sensitive security risk. Emergency status does not remove evidence requirements: record the incident/change reference, authority, preconditions feasible under the circumstances, implementation, validation, rollback position and post-change review.

## Patch domains

The operating team maintains visibility over:

- Next.js/React/Bun/Node-compatible application dependencies;
- Ubuntu/container/runtime and host packages;
- Nginx/TLS/certificate configuration;
- Drupal core, modules, Composer dependencies and PHP/container base;
- PostgreSQL/Supabase/platform maintenance notifications;
- evidence/scanner/notification integration compatibility;
- identity/OIDC integration compatibility;
- CPPS and external agency contract/version changes;
- security advisories and vulnerability findings.

## Planned change workflow

1. Record change ID, owner, purpose, affected components and planned window.
2. Assess security, privacy, data, CPPS/external dependency and availability impact.
3. Confirm current backup/recovery evidence is appropriate for the change; create a controlled **backup** where required.
4. Confirm tested release/configuration and exact version/SHA.
5. Define smoke/functional/security validation.
6. Define a practical **rollback** or reconciliation path, recognizing that application rollback does not automatically reverse data/external transactions.
7. Obtain change authority appropriate to the environment/risk.
8. Execute within the approved window.
9. Run health/smoke/functional validation and monitor for regression.
10. Record result, deviations and any follow-up problem/incident actions.

## Security patch handling

A confirmed material **security** issue is risk-triaged with Identity/Security and Tier-3 Engineering. Remediation priority is based on exploitability, exposure, business/data impact and available mitigations rather than a fabricated repository timing target. Binding remediation timelines belong in the approved security/SLA policy.

Do not bypass CI, authentication, evidence scanning or production-change authorization simply to deploy a security fix faster. Where immediate containment is required, record temporary controls and replace them with a tested permanent remediation.

## Drupal maintenance

For **Drupal** changes:

- review core/module/security advisories and compatibility;
- test clean reconstruction/bootstrap where relevant;
- preserve committed configuration and content migration parity;
- confirm editor identity/OIDC behavior;
- confirm public JSON:API/content behavior;
- validate media access and moderation workflow;
- ensure DB/media backup and recovery evidence is current before material changes.

## TLS and public edge

For **TLS**/Nginx changes:

- validate certificate chain/name/expiry;
- run `nginx -t` before reload;
- preserve HTTPS redirect/HSTS and approved security headers;
- verify public `/api/health` and representative public routes after change;
- verify no internal readiness/credential detail is exposed.

## Database and storage maintenance

Database/storage changes require explicit migration and rollback/reconciliation planning. Never assume application-code rollback reverses a schema/data mutation. For claimant evidence, preserve retention/legal-hold and private-access controls.

## Maintenance calendar

OWC must approve a recurring **maintenance calendar** covering review windows for application dependencies, OS/runtime, Drupal, TLS, database/platform, backups/restore rehearsal and security remediation. This repository deliberately does not state a fixed weekly/monthly/quarterly contractual cadence where none has been approved.

## Change freeze and cutover

Define change-freeze periods around production cutover or critical business events. Emergency work during a freeze requires explicit authority and incident/change evidence.

## Review and reporting

Planned and emergency changes are summarized in the monthly service report. Repeated failed changes, rollbacks or recurring defects should trigger problem/root-cause analysis and possible maintenance-process improvement.
