# OWC Production Monitoring Baseline

This runbook defines provider-neutral monitoring expectations for the OWC application host. It does not require or imply that a particular commercial monitoring platform has been procured.

## Monitoring boundary

Public availability checks should use the shallow `/api/health` endpoint. That endpoint intentionally exposes only application status, service name and timestamp. It must not expose claimant information, configuration values, database details, credentials, CPPS payloads or government-integration payloads.

Deeper readiness information belongs in the authenticated administrator System Readiness view, where configuration status is separated from external UAT/acceptance status.

## Host check

Run:

```bash
cd /var/www/owc
bash deploy/monitor-check.sh
```

The check verifies:

- the configured PM2 application process is running;
- the local application health endpoint responds successfully;
- an optional public HTTPS smoke endpoint responds when configured;
- root filesystem utilization is below the configured warning threshold.

Optional controls:

```bash
OWC_PROCESS_NAME=owc-png \
OWC_LOCAL_HEALTH_URL=http://127.0.0.1:3000/api/health \
OWC_PUBLIC_HEALTH_URL=https://owc.gov.pg/api/health \
OWC_DISK_WARNING_PERCENT=85 \
bash deploy/monitor-check.sh
```

The script does not enumerate environment variables or print credentials.

## Minimum production monitoring

The selected OWC monitoring platform or government operations service should cover at least:

1. external HTTPS availability and response time;
2. TLS certificate expiry/renewal;
3. application process availability/restart loops;
4. CPU, memory and disk capacity;
5. Nginx 5xx/error-rate trends;
6. application error logs and repeated authentication failures;
7. failed deployment/rollback events;
8. notification queue/retry backlog;
9. evidence scanner unavailability where scanning is mandatory;
10. missed backup jobs and failed restore tests;
11. Drupal and database availability from approved internal monitoring paths;
12. external integration failures using metadata-only/correlation telemetry, never claimant payloads.

## Incident creation and alert routing

A material monitoring alert creates or updates an incident under `incident-management.md`. The operating severity classes are **S1 Critical, S2 High, S3 Medium and S4 Low / Service Request**. Monitoring rules may have warning/critical thresholds, but the incident severity reflects actual or credible business/service impact rather than simply copying a tool label.

The incident lifecycle is:

**Detected → Logged → Triaged → Assigned → Investigating → Mitigated/Restored → Resolved → Validated → Closed**

Before go-live, OWC must assign named operational ownership for application/Tier-3, infrastructure, CMS, database/storage, CPPS/integrations and security. Alert destinations, after-hours arrangements and escalation channels must point to those named owners.

Binding acknowledgement/response/restoration/escalation times come from the approved `support-sla.md` decision record. They remain unapproved until OWC/contract acceptance; monitoring configuration must not invent them independently.

## Suggested alert-to-impact mapping

These examples guide triage but do not replace the incident severity assessment:

- public service unavailable, failed rollback, database/storage outage or material security incident → consider S1;
- sustained major error rate, critical dependency outage, backup failure or imminent certificate risk → consider S2;
- capacity threshold, non-critical integration degradation or retry backlog → consider S3;
- informational/planned maintenance and trend events → service record/S4 where action is required.

## Log/privacy rule

Operational logs and monitoring events must use correlation IDs and technical metadata. They must not contain claim evidence content, medical detail, bank details, API credentials, OIDC secrets, service-role keys or complete external-system response payloads.

## Service reporting

The Operations Coordinator summarizes material availability evidence, alert gaps, incidents, capacity trends, certificate risks, failed changes, backup/recovery conditions and integration problems in the monthly `service-report-template.md`. Where no approved SLA/availability target exists, the report states that the target is unapproved rather than calculating a misleading compliance percentage.

## Acceptance evidence

Task 11 repository readiness shows that monitoring hooks/check scripts exist. Production monitoring is accepted only after the nominated platform has actually executed these checks in the approved OWC environment, alerts have reached assigned owners, a test incident/escalation has been demonstrated, and the service-reporting path has evidence from the real platform.
