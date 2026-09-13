# OWC Operational Administration and SLA Design

## Purpose

Define the repository-side operating model required to support the Office of Workers' Compensation (OWC) digital platform after implementation and during the required 12-month Tier-3 support period. The model must be usable before named personnel and contractual SLA timings are finalized, while never presenting unapproved targets as binding obligations.

## Design principles

1. **Role-based, not person-dependent.** Repository documentation defines accountable operational roles. Named officers, phone numbers, distribution lists and after-hours contacts are deployment/contract records and remain external until OWC assigns them.
2. **No invented SLA figures.** Severity definitions and escalation paths are defined now; binding acknowledgement, response, restoration and resolution targets remain `UNAPPROVED` until OWC accepts them.
3. **One incident lifecycle.** Monitoring alerts, user-reported incidents, security events, failed releases, backup failures and integration outages enter the same controlled incident process and may invoke specialist runbooks.
4. **Tier-3 means engineering escalation.** Tier-3 handles defects, complex integration failures, code/configuration analysis, release fixes, root-cause analysis and vendor/developer escalation. It does not replace Tier-1 user reception or Tier-2 functional/technical administration.
5. **12-month support is a service period, not a fabricated service window.** The operating model records the required 12-month Tier-3 support obligation but leaves exact start date, business hours, after-hours coverage and service targets for contractual acceptance.
6. **Change and incident separation.** Emergency fixes still require evidence, release identification and post-change review. Routine patches use planned maintenance/change control.
7. **Evidence over assertion.** Monthly service reporting records availability evidence, incidents, releases, security/backup outcomes, integration issues and outstanding risks without claiming live monitoring or SLA attainment where no approved target exists.
8. **Privacy by default.** Operational records use technical metadata/correlation IDs and avoid claimant evidence, medical/banking details and secrets.

## Operating roles

The minimum operating model uses these functions:

- **OWC Service Owner** — accountable for service acceptance, business prioritization and SLA approval.
- **OWC Operations Coordinator** — owns daily operational coordination, incident register, maintenance calendar and service reporting.
- **Application/Tier-3 Engineering** — diagnoses application defects, release failures, integration defects and code/configuration issues.
- **Infrastructure/Platform Operations** — host/container, Nginx, TLS, network, process supervision, capacity and backup execution.
- **Database/Storage Operations** — application database, Drupal DB/media and claimant evidence storage recovery/availability.
- **CMS Administration** — Drupal editorial operations and editor-access issues.
- **Identity/Security** — IdP/MFA/RBAC/security events, vulnerability remediation and security acceptance.
- **CPPS / Integration Liaison** — coordinates authoritative CPPS and external agency interfaces; OWC does not override external system authority.
- **Tier-1/Tier-2 Support** — user reception, triage, known-workaround guidance, account/functional administration and escalation to Tier-3.

One person may temporarily hold several roles, but ownership must still be explicit in the service register.

## Incident severity model

Use four repository-defined severity classes while targets remain contract-controlled:

- **S1 Critical** — complete public/claims service outage, confirmed material security incident, database/storage outage, failed recovery/rollback, or critical evidence-control failure affecting safe service.
- **S2 High** — major feature unavailable or materially degraded with broad operational impact; critical CPPS/notification dependency unavailable during active service; repeated release/backup failure with significant risk.
- **S3 Medium** — limited degradation, non-critical integration issue, capacity threshold, retry backlog, isolated functional defect with workaround.
- **S4 Low / Service Request** — low-impact defect, information request, routine administration, planned enhancement or maintenance request.

Severity may be raised or lowered only with recorded rationale. A security incident may invoke security-specific procedures regardless of severity label.

## Incident lifecycle

`Detected → Logged → Triaged → Assigned → Investigating → Mitigated/Restored → Resolved → Validated → Closed`

Required incident record metadata:

- incident ID;
- detection/report time and source;
- severity and rationale;
- affected service/component;
- technical owner and business owner;
- correlation IDs/log references only where safe;
- impact statement;
- mitigation/restoration actions;
- release/configuration changes if any;
- external dependency/escalation;
- validation evidence;
- root-cause/post-incident review requirement;
- closure approvals.

S1/S2 incidents require a post-incident review unless the Service Owner documents why one is unnecessary.

## SLA framework

The repository provides a decision table with four metrics per severity:

- acknowledgement target;
- technical response/engagement target;
- service restoration/workaround target;
- resolution or action-plan target.

All numeric values remain `UNAPPROVED` until OWC/contract approval. Measurement rules must be agreed together with support hours, pause/exclusion conditions and external-dependency treatment. The model distinguishes service restoration from permanent defect resolution.

## 12-month Tier-3 support model

The support period covers at minimum:

- application defect diagnosis/fix;
- complex claims/evidence workflow defects;
- Drupal/Next.js integration defects;
- CPPS and Integration Hub adapter diagnosis within OWC responsibility;
- security-remediation engineering;
- release and rollback engineering support;
- database/schema/application compatibility analysis;
- performance/capacity engineering assistance;
- root-cause analysis for significant incidents;
- knowledge transfer/runbook maintenance;
- monthly service-report contribution.

Excluded or separately governed activities include new major functionality, external agency fixes, telecom/provider outages outside OWC/vendor control and production actions lacking OWC authorization.

## Maintenance and patching

Maintain a service calendar containing:

- application/library/security patch review;
- OS/container/runtime patching;
- Drupal core/module review;
- TLS/certificate review;
- database/platform maintenance;
- backup/restore rehearsal schedule;
- vulnerability-remediation dates;
- planned releases and change freezes.

Patch cadence is defined as a process, not an invented frequency. Security-critical remediation is risk-prioritized and may use emergency change procedures; routine changes require pre-check, backup/recovery readiness, tested release, smoke checks and rollback plan.

## Service reporting

A monthly service report template records:

- service period and ownership;
- availability/monitoring evidence available for the period;
- incidents by severity and trend;
- SLA result only where an approved target exists;
- releases/changes;
- security findings/remediation;
- backup/restore outcomes;
- CPPS/external integration health/issues;
- notification/scanner status;
- capacity/performance observations;
- support requests/Tier-3 workload;
- risks, decisions and actions;
- next-period maintenance plan.

## Repository deliverables

- operating model/runbook;
- incident-management runbook;
- SLA and 12-month Tier-3 support framework;
- maintenance/patching runbook;
- monthly service-report template;
- runbook index;
- tests proving unapproved SLA targets are not fabricated and required operational subjects are present;
- reconciled handover/monitoring/task-status documentation.

## Production acceptance boundary

Task 15 is repository-complete when the operating model and evidence templates are implemented and CI-verified. Production operational acceptance still requires:

- named role owners and contact/escalation channels;
- approved support hours and after-hours arrangements;
- approved SLA numeric targets/measurement rules;
- monitoring platform/alert destinations demonstrated;
- service desk/Tier-1/Tier-2 intake process activated;
- 12-month Tier-3 support commencement/end dates and commercial terms confirmed;
- incident exercise/escalation demonstration;
- maintenance calendar approved;
- service-report ownership and first reporting cycle agreed.
