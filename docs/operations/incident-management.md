# OWC Incident Management Runbook

## Purpose

Provide one controlled incident process for public-service outages, application faults, identity/security events, database/storage incidents, failed changes, backup/recovery failures and CPPS/external-integration degradation.

## Severity

### S1 Critical
Complete public/claims service outage, confirmed material security incident, database/storage outage, failed recovery/rollback, or a critical evidence-control failure that prevents safe service.

### S2 High
Major feature unavailable or materially degraded with broad operational impact; critical dependency unavailable during active service; repeated release or backup failure creating significant service risk.

### S3 Medium
Limited degradation, non-critical integration problem, retry backlog, capacity threshold or isolated functional defect where a practical workaround exists.

### S4 Low / Service Request
Low-impact defect, information/request for assistance, routine administration, planned enhancement or maintenance request.

Severity changes require a recorded impact rationale. Security events may invoke security-specific escalation regardless of the assigned severity.

## Lifecycle

**Detected → Logged → Triaged → Assigned → Investigating → Mitigated/Restored → Resolved → Validated → Closed**

Restoration and resolution are deliberately separate. Service may be restored through a safe workaround while permanent corrective work continues.

## Required incident record

Record:

- incident ID and detection/report timestamp;
- source of detection and affected component/service;
- severity and impact rationale;
- business owner and technical owner;
- safe correlation ID, alert ID and log references;
- user/business impact without unnecessary claimant detail;
- timeline of actions and decisions;
- containment, mitigation and restoration actions;
- release/configuration/rollback reference where applicable;
- security classification if relevant;
- CPPS/external dependency escalation and owner;
- validation evidence;
- root cause or problem record where required;
- corrective actions, owners and due dates;
- closure approval.

Do not paste claimant evidence, medical information, bank details, credentials, complete external-system payloads or secrets into the incident record.

## Triage and assignment

1. Confirm whether there is an active safety/security concern requiring immediate containment.
2. Confirm affected service, scope and business impact.
3. Assign S1–S4 severity.
4. Check for an approved known workaround or recent change.
5. Assign the correct functional owner from the operating model.
6. Open an external dependency escalation only with approved minimum data.
7. Start stakeholder communications appropriate to the incident impact.

## Technical investigation

Use health/readiness data, monitoring alerts, correlation IDs, application/Nginx logs, database/provider telemetry and release identifiers. Do not enable verbose secret-bearing logs as an investigation shortcut.

For release-related incidents, follow the versioned release/rollback procedure. For data/recovery incidents, follow the backup/DR runbook. For security incidents, preserve relevant evidence and coordinate with Identity/Security before destructive remediation.

## Communications and escalation

The production service register must define named contacts and escalation channels for:

- Service Owner;
- Operations Coordinator;
- Tier-1/Tier-2;
- Tier-3 engineering;
- infrastructure/platform;
- database/storage;
- security/identity;
- CPPS and each material agency/provider dependency.

Notification cadence and escalation timings are governed by the formally approved SLA/support schedule. Until that approval exists, repository documentation must not imply binding timing commitments.

## External-system incidents

OWC must distinguish its local service condition from an external dependency outage. The CPPS / Integration Liaison records the external ticket/reference and OWC impact. Local fallback/reference services must not be silently enabled in production to conceal an unavailable authoritative external service.

## Validation and closure

Before closing:

- confirm the affected service path is functioning;
- confirm security controls have not been weakened;
- verify any release/change identifier and smoke checks;
- reconcile CPPS/external authority state where relevant;
- confirm monitoring has returned to expected status;
- record outstanding corrective actions;
- obtain business validation for material incidents.

## Post-incident review

Every S1 Critical and S2 High incident requires a **post-incident review** unless the OWC Service Owner records why one is not necessary. Review cause, detection, containment, restoration, communications, recovery/rollback effectiveness, data/integration reconciliation, control gaps and corrective actions. The review is for improvement and evidence, not blame.
