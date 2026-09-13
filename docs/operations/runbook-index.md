# OWC Operations Runbook Index

This index is the operational navigation point for the OWC digital service. Repository controls marked “ready” still require the stated **external acceptance** before they are treated as live production capabilities.

| Area | Authoritative repository reference | Functional owner | Repository state | External acceptance / activation |
| --- | --- | --- | --- | --- |
| Operating model | `operating-model.md` | OWC Service Owner / Operations Coordinator | Defined | Named owners, contacts, service desk and reporting cycle |
| Incident management | `incident-management.md` | Operations Coordinator | Defined | Escalation contacts, communications and approved SLA targets |
| Monitoring | `production-monitoring.md` | Infrastructure/Platform Operations | Hooks/runbook implemented | Monitoring platform, alerts, routes and incident exercise demonstrated |
| SLA / support | `support-sla.md` | OWC Service Owner / Tier-3 Engineering | Framework defined | Approved service hours/targets and 12-month Tier-3 commercial/service activation |
| Maintenance | `maintenance-and-patching.md` | Operations Coordinator / technical owners | Process defined | Approved maintenance calendar/change authority |
| Monthly reporting | `service-report-template.md` | Operations Coordinator | Template defined | Named report owner and accepted reporting cycle |
| Deployment/release | `../DEPLOYMENT_UBUNTU_24_04.md` | Application/Tier-3 + Infrastructure | Repository controls implemented | Actual host/DNS/TLS/secrets, change authority and production release |
| Backup / DR | `backup-disaster-recovery.md` | Database/Storage + Infrastructure | Repository controls implemented | RPO/RTO, PITR/retention/off-host copy and restore rehearsal accepted |
| Restore evidence | `restore-rehearsal-evidence-template.md` | Database/Storage / Service Owner | Template defined | Exercise performed and signed off |
| RPO/RTO | `rpo-rto-decision-record.md` | OWC Service Owner | Targets UNAPPROVED | Formal business/technical/security approval |
| Claim evidence readiness | `claims-evidence-production-readiness.md` | Database/Storage / Identity-Security | Repository controls implemented | Real private bucket/scanner/retention/storage acceptance |
| External Integration Hub | `production-integration-hub.md` | CPPS / Integration Liaison | Connector foundation implemented | Real agency contracts/endpoints/UAT/security acceptance |
| Reference CPPS | `reference-cpps.md` | Application/Tier-3 | Reference/UAT implementation | Never production authority; real CPPS mapping/UAT still required |
| Security assurance | `../SECURITY_CHECKLIST.md` plus forthcoming security-assurance package | Identity/Security | Partial | Independent vulnerability/penetration assessment and sign-off |
| UAT | `../UAT_CHECKLIST.md` | OWC Service Owner / business testers | Existing checklist, expanded UAT package pending | Formal production-like UAT/sign-off |
| Production cutover | Issue #8 plus forthcoming **production cutover** runbook | OWC Service Owner | Acceptance gates tracked | Explicit go-live authorization and execution |

## Incident entry points

The following events create or update an incident/problem record under `incident-management.md` when they affect service:

- monitoring alert or public health failure;
- user/service-desk report;
- failed deployment/rollback;
- backup or restore-test failure;
- security/identity alert;
- notification/scanner outage;
- database/storage degradation;
- CPPS/external integration failure;
- capacity/TLS risk requiring operational action.

## Escalation rule

The operating model defines functional roles; the production service register supplies the actual named people, providers, phone numbers, email/distribution lists, on-call path and escalation targets. Repository documentation must not invent these operational contacts.

## Change hierarchy

1. Use the maintenance/change process for planned work.
2. Use incident management for unplanned service impact.
3. Use the deployment/release runbook for application release/rollback.
4. Use backup/DR for data/service recovery.
5. Use security procedures for security-specific containment/evidence/remediation.
6. Use CPPS/Integration Liaison for authoritative external-system issues.
7. Use the production cutover runbook only after all acceptance gates are formally approved.

## Governance

The Operations Coordinator reviews this index when a runbook changes and ensures the monthly service report captures material incidents, changes, recovery/security evidence, integration risks and outstanding external acceptance items.
