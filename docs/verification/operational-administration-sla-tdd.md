# OWC Operational Administration / SLA TDD Evidence

## Branch

`feature/operational-administration-sla`

## RED

- Commit: `44eac681abe695e7b187532324341e825183957f`
- CI / Deploy run: `34759940286`
- Existing baseline: **141 tests passed**.
- Expected new failures: **6**.

All six failures were caused only by the six required operating documents not yet existing:

1. `docs/operations/operating-model.md`
2. `docs/operations/incident-management.md`
3. `docs/operations/support-sla.md`
4. `docs/operations/maintenance-and-patching.md`
5. `docs/operations/service-report-template.md`
6. `docs/operations/runbook-index.md`

The contract requires functional ownership, S1–S4 severity, one incident lifecycle, 12-month Tier-3 support, sixteen explicitly `UNAPPROVED` SLA target cells, controlled maintenance/rollback, monthly operational reporting and runbook governance.

## Implementation boundary

Repository implementation deliberately does not invent:

- named personnel/contact channels;
- support hours/on-call windows;
- acknowledgement/response/restoration/resolution times;
- service-credit/commercial terms;
- production monitoring platform/alert destination;
- the actual start/end dates of the required 12-month Tier-3 service.

Those are external operational/contract acceptance items.

## Final verification requirement

Before opening the stacked draft PR, the exact final head must pass:

- deployment/recovery shell syntax validation;
- all Bun tests including the operating-model contract;
- lint/type-check;
- Next.js production build;
- Drupal clean-room reconstruction;
- with Ubuntu production deployment skipped because the branch is not `main`.
