# OWC Backup and Disaster Recovery Runbook

## Purpose

This runbook defines the repository-side recovery framework for the Office of Workers' Compensation (OWC) portal and CMS. It deliberately distinguishes **recovery tooling** from **production acceptance**: scripts and documentation can make recovery repeatable, but they do not prove that provider backups, off-host copies, retention schedules or production restores have been activated.

## Recovery scope

| Component | Authority / role | Repository recovery mechanism | External acceptance still required |
| --- | --- | --- | --- |
| OWC application PostgreSQL / Supabase database | Portal operational data, local claim mirror, audit/application records | `backup-application-db.sh` creates a PostgreSQL custom-format dump | Authoritative OWC database access, provider backup/PITR policy, retention, off-host copy, restore test |
| Claim evidence object storage | Restricted claimant evidence | `backup-evidence-export.sh` archives an **operator-provided read-only export directory** | Approved export mechanism, private storage, encryption, retention/legal-hold policy, off-host copy, restore validation |
| Drupal PostgreSQL database | Authoritative CMS content/config state stored in DB | `backup-drupal.sh` creates `drupal-db.dump` | Production Drupal environment, schedule, retention, off-host copy, restore test |
| Drupal public media | CMS-uploaded public files | `backup-drupal.sh` archives `/opt/drupal/web/sites/default/files` only | Production media volume/path, retention, off-host copy, restore test |
| Application/Drupal source and committed configuration | Release definition | Git commit SHA is recorded in `backup-manifest.json`; source/configuration are recovered from approved repository history | Repository availability and release/change-management controls |
| Secrets and credentials | Runtime security material | **Not included in backup sets** | Approved secret manager, rotation/recovery process, break-glass ownership |
| CPPS and external agency systems | External authoritative systems | **Not backed up or replayed by OWC repository tooling** | Agency-owned continuity, approved API reconnection and post-recovery reconciliation |

## Backup-set workflow

Create a dedicated private directory for one backup set and export its path as `OWC_BACKUP_SET_DIR`. Use `OWC_ENVIRONMENT` only as a non-secret environment label.

1. Run `deploy/backup/backup-application-db.sh` with PostgreSQL environment credentials supplied by the operator's protected runtime.
2. Run `deploy/backup/backup-drupal.sh` against the approved Drupal Compose deployment where applicable.
3. Produce an approved read-only evidence export using the storage provider's supported mechanism, then set `OWC_EVIDENCE_EXPORT_DIR` and run `deploy/backup/backup-evidence-export.sh`.
4. Run `deploy/backup/finalize-backup.sh`.
5. Run `deploy/backup/verify-backup.sh`.
6. Transfer the completed backup set to the approved logically separate/off-host repository using the organization's protected transfer process.
7. Record backup outcome, destination class, retention policy and operator in the operational record. Do not put destination credentials in the manifest.

Every script uses fail-fast shell behavior and a private `umask`. The final manifest records release metadata and conservative verification flags; it does not claim provider PITR, off-host copy or restore rehearsal were proven merely because a dump succeeded.

## Integrity requirements

A backup set is not eligible for restore rehearsal unless:

- `backup-manifest.json` exists;
- `SHA256SUMS` exists;
- `deploy/backup/verify-backup.sh` completes successfully;
- all expected component files for the intended recovery scope are present;
- the operator has confirmed the source backup set is the intended one.

A successful backup job is **not** restore evidence.

## Restore rehearsal safety boundary

Repository restore scripts are intentionally rehearsal-only. They require:

- `OWC_DR_REHEARSAL_CONFIRM=NONPRODUCTION`;
- `OWC_ENVIRONMENT` that is not `prod`, `production` or `live`;
- an application database target name ending `_dr_rehearsal`;
- a Drupal Compose project name containing `dr-rehearsal`.

The scripts verify checksums before destructive restore operations. They are not production cutover tooling and must not be modified to bypass these safeguards during an incident.

## Restore order

Use the following default recovery order unless an approved incident plan documents a different dependency order:

1. **Infrastructure and network** — establish approved non-production recovery host/network, DNS isolation and access controls.
2. **Secret references** — provision recovery-environment credentials from the approved secret manager. Do not restore secrets from backup archives.
3. **Application database** — restore the PostgreSQL dump into an explicitly isolated rehearsal database and validate schema/data access.
4. **Drupal database and media** — restore `drupal-db.dump` and `drupal-media.tar.gz`, then verify Drupal serves successfully.
5. **Evidence repository** — restore the evidence export into an approved isolated private storage target using the provider's supported import/recovery process; verify object counts/metadata and legal-hold constraints.
6. **Application release** — deploy the Git release identified by the manifest or the specifically approved recovery release.
7. **Identity and notifications** — reconnect non-production identity/notification services using approved recovery credentials.
8. **External integrations** — reconnect CPPS and agency interfaces only to approved DEV/UAT endpoints.
9. **Functional validation** — run health, authentication, content, claims, evidence and audit checks.
10. **Reconciliation** — compare OWC local state with CPPS/external authoritative systems before declaring recovery valid.

## CPPS reconciliation rule

CPPS remains authoritative for production claim/payment state. OWC backup recovery must **never** replay payment operations or assume that a restored local claim mirror supersedes CPPS.

After a recovery rehearsal or real incident recovery:

- reconnect to the approved CPPS environment;
- compare claim reference, status, workflow/event state and payment status using the approved contract;
- record mismatches for controlled reconciliation;
- never create or repeat a payment merely to make the restored OWC mirror match;
- obtain business/CPPS-owner acceptance before production service is declared reconciled.

The reference CPPS may be used for rehearsal/UAT only when explicitly enabled. It is not a substitute for live CPPS reconciliation.

## RPO and RTO

No RPO or RTO is invented in this repository. Formal targets must be approved by OWC after considering claim criticality, evidence/legal obligations, hosting capabilities, CPPS dependency and business operating hours. Use `docs/operations/rpo-rto-decision-record.md` to record the approved values and rationale.

Backup frequency and retention must then be configured to meet the approved RPO. Recovery architecture, staffing and rehearsal frequency must be sufficient to demonstrate the approved RTO.

## Restore rehearsal evidence

Use `docs/operations/restore-rehearsal-evidence-template.md` for each exercise. At minimum capture:

- backup-set identifier and manifest release SHA;
- source environment classification;
- recovery target classification;
- start/end time;
- checksum verification;
- database/Drupal/evidence recovery results;
- application health and functional checks;
- CPPS/external reconciliation result or explicit non-applicability;
- measured recovery duration/data-loss point;
- deviations, incidents and corrective actions;
- technical and business sign-off.

## Production acceptance gates

Task 12 can only be called production-complete after OWC has evidence for all of the following:

- approved backup frequency and retention;
- approved RPO and RTO;
- automated production database backup/PITR where applicable;
- Drupal database and media backup schedule;
- evidence-repository backup/export schedule that respects privacy, retention and legal hold;
- logically separate/off-host backup copy;
- encryption and access-control verification;
- monitoring/alerting for backup failures;
- at least one successful restore rehearsal in an approved isolated environment;
- documented CPPS reconciliation procedure exercised against an approved non-production interface;
- remediation of material rehearsal findings;
- named operational ownership and sign-off.

Until these external gates are met, repository status is **recovery-ready / external activation required**, not production DR accepted.
