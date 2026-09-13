# OWC Backup and Disaster Recovery Readiness Design

## Purpose

Provide a repository-controlled recovery framework for OWC that can create verifiable backup sets, rehearse restoration safely in non-production, and document the operational decisions still requiring OWC/provider approval.

This work makes the system **recovery-ready**; it does not claim that provider-side PITR, offsite retention, a production backup schedule, or a production restore exercise has already been activated.

## Recovery scope

The recovery inventory is divided by authority and recoverability:

1. **OWC application PostgreSQL / Supabase data** — operational tables, profiles, audit, enquiries, claim-tracking and claims-evidence metadata. A portable `pg_dump` path is provided when approved PostgreSQL credentials are supplied. Managed Supabase PITR/backup retention remains a provider/environment control.
2. **Drupal PostgreSQL** — editorial content, workflow state, users/configuration stored in the Drupal database.
3. **Drupal public media** — only `sites/default/files`; runtime settings/secrets are deliberately excluded.
4. **Claim evidence object storage** — repository tooling can archive an approved read-only provider export/mount. Provider-native versioning/replication/export remains external.
5. **Application and Drupal configuration** — Git commit history is the versioned source; backup manifests record release SHA. Git is not a substitute for database/media backups.
6. **Secrets and credentials** — backup artifacts must not contain secret values. Recovery documentation records required secret *identifiers/owners* only; secret escrow/replication belongs in the approved secret-management platform.
7. **CPPS and external agencies** — authoritative external systems are not backed up or replayed by OWC repository tooling. OWC restores its local state, reconnects, then reconciles against those systems.

## Backup-set contract

A backup set is an operator-created directory with restrictive permissions. Depending on configured components it may contain:

- `application-db.dump`
- `drupal-db.dump`
- `drupal-media.tar.gz`
- `evidence-export.tar.gz`
- `backup-manifest.json`
- `SHA256SUMS`

The finalized manifest contains only non-secret metadata: UTC creation time, OWC release SHA, environment label, component filenames, component presence, and the fact that provider-side/offsite controls require separate verification.

Every finalized artifact is hashed. Restore/rehearsal starts by verifying checksums; a corrupted or incomplete backup fails closed.

## Backup safety

- shell scripts use `set -euo pipefail` and restrictive `umask`;
- required configuration is checked before destructive/backup work;
- scripts never print database passwords, API keys, connection URIs or environment dumps;
- PostgreSQL credentials use standard environment variables rather than embedding a password in a command line;
- Drupal media backup excludes settings files and secrets;
- evidence backup consumes an operator-provided read-only export/mount rather than inventing provider access;
- CI syntax-checks scripts but never performs a live production backup or restore.

## Restore-rehearsal boundary

Repository restore tooling is for isolated DEV/UAT/rehearsal targets only. It must refuse to run unless:

- the operator explicitly confirms non-production rehearsal mode;
- the environment is not labelled `prod` or `production`;
- database targets intended for destructive restore use an unmistakable rehearsal name;
- backup checksums pass first.

A production restoration remains an incident/change-controlled action requiring OWC authorization.

## Restore order

Recommended recovery sequence:

1. provision/verify infrastructure, networking and secret-manager access;
2. verify the backup set and release SHA;
3. restore application PostgreSQL/Supabase data to the approved recovery target;
4. restore Drupal database and public media;
5. re-deploy the recorded compatible application/Drupal configuration;
6. verify identity, scanner, notification and external connector configuration without exposing secrets;
7. reconnect CPPS and external providers;
8. perform reconciliation against CPPS/external authorities rather than replaying external transactions;
9. run health, data-integrity, security and business smoke tests;
10. record recovery evidence and obtain business/operations acceptance.

## RPO/RTO

No RPO or RTO value is invented in code or documentation. The repository contains a decision record that lists service/data classes and requires OWC approval of target RPO/RTO, backup frequency, retention, offsite copy, restore-test frequency and business owner.

## Restore evidence

A successful backup is not recovery evidence. A rehearsal is complete only when an isolated restore has been performed and the evidence record captures:

- backup set and release SHA;
- environment and date;
- operator/reviewer;
- checksum verification;
- database/media restoration result;
- application/Drupal health;
- identity/integration reconnect checks;
- CPPS reconciliation result;
- measured recovery duration and observed data-loss window where measurable;
- exceptions and approvals.

## Production acceptance

Task 12 can be called repository-complete when backup/verification/rehearsal tooling, runbooks and decision records are CI-verified. Production acceptance additionally requires the nominated OWC environment, approved backup destinations/retention/encryption, provider PITR/offsite controls, an executed restore rehearsal, approved RPO/RTO and operational sign-off.
