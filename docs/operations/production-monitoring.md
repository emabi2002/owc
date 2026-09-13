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

## Alert routing

Before go-live, OWC must assign named operational ownership for application, infrastructure, CMS, database/storage, CPPS and security incidents. Alert destinations, after-hours arrangements, severity thresholds and escalation times must be approved as part of the operational/SLA work package.

Suggested severity model:

- **Critical:** public service unavailable, evidence security control unavailable with fail-closed ingestion affected, confirmed security incident, database/storage outage, failed rollback.
- **High:** sustained error rate, CPPS/critical notification dependency unavailable during service hours, backup failure, certificate near expiry.
- **Medium:** disk/capacity threshold, non-critical integration degradation, repeated retry backlog, elevated failed-logins requiring investigation.
- **Low/Information:** planned release, maintenance event, successful restore exercise, capacity trend requiring future action.

## Log/privacy rule

Operational logs and monitoring events must use correlation IDs and technical metadata. They must not contain claim evidence content, medical detail, bank details, API credentials, OIDC secrets, service-role keys or complete external-system response payloads.

## Acceptance evidence

Task 11 repository readiness can show that monitoring hooks/check scripts exist. Production monitoring is only accepted after the nominated platform has actually executed these checks in the approved OWC environment, alerts have been received by the assigned operations team, and a test incident/escalation has been demonstrated.
