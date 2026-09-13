# OWC Final Cutover Readiness Design

## Purpose

Prepare the OWC repository for a controlled production go-live decision without performing, authorizing or implying production cutover. The package turns the remaining external dependencies in issue #8 and the completed repository work packages into an explicit, evidence-based **GO / NO-GO** process.

Repository completion of Task 16 means OWC has a versioned cutover runbook, evidence register, rollback/reconciliation procedure, sign-off package and executable fail-closed readiness evaluator. Actual production cutover remains a separate, explicitly authorized change activity.

## Safety boundary

- No script in this package deploys, merges, changes DNS, rotates production credentials, modifies a production database, sends real payments or invokes live agency transactions.
- A repository/CI success cannot produce production authorization.
- Missing, blocked or unverified required evidence produces `NO-GO`.
- `NOT_APPLICABLE` is accepted only when an authorized scope-decision reference is recorded.
- Production authorization must be an explicit separate decision with an approval reference; it cannot be inferred from technical readiness.
- Reference/sandbox UAT cannot satisfy a required `LIVE UAT` or agency acceptance gate.
- CPPS remains authoritative for production claim/payment state and must be reconciled after any relevant recovery/cutover event.

## Cutover readiness model

### Gate status

Each gate has one of:

- `ACCEPTED` — required evidence exists and the accountable owner has accepted it;
- `NOT_READY` — work/evidence is incomplete;
- `BLOCKED` — an external dependency or defect prevents acceptance;
- `NOT_APPLICABLE` — deliberately out of the production scope with an authorized scope-decision reference.

### Required gate families

The evaluator requires a decision record for every gate below:

1. `release-candidate` — immutable release SHA and exact-head CI/reference-UAT evidence;
2. `production-platform` — authoritative host/container platform, DNS, TLS, Nginx/firewall/monitoring baseline;
3. `production-data` — authoritative OWC Supabase/database/private storage, schema/migration verification and access ownership;
4. `drupal-content` — production Drupal, final content migration/parity and editorial workflow acceptance;
5. `identity-access` — production IdP/OIDC/MFA, RBAC/RLS and break-glass acceptance;
6. `evidence-security` — private evidence storage/signing, malware scanning and retention/legal-hold acceptance;
7. `notifications` — approved email/SMS service, credentials/templates and delivery UAT;
8. `cpps` — authoritative CPPS UAT/production contract, credentials, interoperability UAT and reconciliation ownership;
9. `external-integrations` — required NID/employer/insurance/payment/medical or other agency contracts and acceptance, with explicit scope decisions for any omitted service;
10. `backup-recovery` — approved RPO/RTO, production backup/PITR/off-host controls and successful isolated restore rehearsal;
11. `security-assessment` — independent assessment, blocker remediation/retest and security sign-off;
12. `business-uat` — formal production-like UAT, defect/dependency disposition and business-owner sign-off;
13. `operations-support` — named operational owners/contact paths, monitoring/alert routing, incident/SLA/support arrangements;
14. `cutover-change` — approved change window, communication plan, migration/smoke sequence and rollback authority;
15. `production-authorization` — explicit final go-live authorization reference from the accountable OWC authority.

No required gate may be silently omitted.

## Evidence record

The evaluator consumes a JSON decision file containing:

- schema version;
- release SHA;
- target environment identifier;
- generated/decision timestamps;
- one record per required gate;
- gate owner/acceptance role;
- status;
- one or more evidence references when `ACCEPTED`;
- blocker/notes where relevant;
- authorized scope-decision reference when `NOT_APPLICABLE`;
- explicit production authorization fields for the final gate.

The file contains references/decisions, not credentials or sensitive payloads.

## Fail-closed evaluation rules

`GO` is returned only when:

- every required gate is present exactly once;
- every required gate is `ACCEPTED`, except a gate may be `NOT_APPLICABLE` only with an authorized scope-decision reference;
- every `ACCEPTED` gate has at least one evidence reference and an acceptance owner;
- the release SHA is non-empty and matches the release being considered;
- the `production-authorization` gate is explicitly `ACCEPTED` and includes a distinct production authorization reference;
- there are no unresolved `BLOCKED` or `NOT_READY` gates.

Otherwise the evaluator returns `NO-GO` and lists the blocking reasons. It never performs the cutover.

## Cutover runbook sequence

### Phase 0 — decision freeze

- identify release SHA and approved change window;
- freeze unapproved changes;
- confirm current evidence register and GO/NO-GO decision;
- name cutover lead, technical leads, business/security authority and rollback authority;
- establish communication bridge/channel and incident escalation.

### Phase 1 — pre-change protection

- confirm recent successful backups and isolated restore evidence;
- record current application/Drupal/database release/config state;
- validate production secrets/credentials through approved mechanisms without printing them;
- confirm rollback artifacts and owners;
- confirm no reference/sandbox service will be mistaken for production.

### Phase 2 — final data/content/config preparation

- apply approved database hardening/migrations under controlled change;
- run final Drupal content migration/parity and editorial acceptance;
- configure identity, scanner, notifications, CPPS and approved agency endpoints;
- reconcile configuration against the accepted release SHA;
- do not replay external/CPPS transactions as part of data migration.

### Phase 3 — application cutover

- deploy the approved release using the existing health-checked release process;
- activate approved Nginx/TLS/DNS routing according to the change plan;
- perform shallow health checks before exposing normal traffic;
- stop and invoke rollback if mandatory smoke checks fail.

Actual commands in this phase are operator-controlled and not executed by the readiness package.

### Phase 4 — smoke and reconciliation

Verify:

- public HTTPS/health/security headers;
- authentication/MFA/RBAC;
- Drupal published content;
- claim tracking/lodgement with approved test data;
- evidence upload/scanner where safe;
- notifications;
- CPPS/required agency connectivity using approved production smoke methods;
- logs/alerts/monitoring;
- no browser-visible server credentials;
- database/content/config versions;
- CPPS/external transaction state is reconciled and no reference data is presented as live.

### Phase 5 — stabilization and acceptance

- monitor agreed stabilization indicators;
- log defects/incidents and invoke rollback criteria if required;
- business/security/technical authority records final outcome;
- close the change only when evidence and reconciliation are complete.

## Rollback and reconciliation boundary

Application code rollback may use the existing `deploy/release.sh` mechanism. That rollback does **not** automatically reverse:

- database migrations/data changes;
- Drupal editorial/content changes;
- private object/evidence storage mutations;
- CPPS claim/payment state;
- external agency/payment transactions;
- DNS/TLS/platform changes.

The runbook therefore separates technical rollback from authoritative-state reconciliation. Rollback decisions must specify which components are reversed, restored, held or reconciled, with named ownership.

## Cutover evidence package

The repository will contain:

- machine-readable readiness evidence template;
- GO/NO-GO evaluator and tests;
- evidence register/template;
- final cutover runbook;
- rollback/reconciliation runbook;
- smoke-test checklist;
- sign-off template;
- updated issue #8 linkage and master task status.

## TDD / verification

A RED contract first requires the evaluator rules, required gate list and cutover documents. Existing OWC tests/security assurance must remain green while the new cutover tests fail for the missing package.

Final exact-head verification requires:

- repository security assurance;
- deployment/recovery/security shell validation;
- full Bun tests including cutover evaluator behavior;
- reference UAT success and artifact preservation;
- lint/type-check;
- Next.js production build;
- Drupal clean-room reconstruction;
- production SSH deployment skipped because the branch is not `main`.

## External completion boundary

Task 16 repository readiness does not mean OWC is live. The evaluator's `GO` decision is meaningful only when OWC operators populate it with genuine, current production evidence and explicit authorization. This development session will not populate false acceptance values or execute production cutover.
