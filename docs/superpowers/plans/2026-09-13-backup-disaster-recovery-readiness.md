# OWC Backup and Disaster Recovery Readiness Implementation Plan

**Goal:** Make OWC repository-side backup and recovery controls executable and testable without performing live production backup/restore actions.

**Architecture:** Portable PostgreSQL dumps, Drupal DB/media backup, approved evidence-export archival, checksum/manifest verification and guarded non-production restore rehearsal. Provider PITR/offsite retention and real production rehearsal remain external acceptance gates.

**Spec:** `docs/superpowers/specs/2026-09-13-backup-disaster-recovery-design.md`

## Global constraints

- Never embed or print secrets.
- Never execute live backup/restore from CI.
- Restore rehearsal must fail closed outside an explicitly confirmed non-production target.
- Do not invent RPO/RTO.
- Do not back up or replay CPPS/external-authority transactions.
- No merge/deploy to `main`.

### Task 1: Recovery safety contract

**Files:**
- Create: `src/lib/operations/backup-dr.test.ts`

- [ ] Write failing tests describing required backup scripts, checksum verification, secret exclusions and rehearsal guardrails.
- [ ] Confirm RED because recovery tooling does not yet exist.

### Task 2: Backup-set tooling

**Files:**
- Create: `deploy/backup/common.sh`
- Create: `deploy/backup/backup-application-db.sh`
- Create: `deploy/backup/backup-drupal.sh`
- Create: `deploy/backup/backup-evidence-export.sh`
- Create: `deploy/backup/finalize-backup.sh`

- [ ] Implement fail-closed PostgreSQL backup using environment credentials.
- [ ] Implement Drupal DB + public-media backup without settings/secrets.
- [ ] Implement evidence backup from an operator-provided read-only export path.
- [ ] Finalize manifest + SHA-256 checksums with release metadata only.

### Task 3: Verification and restore rehearsal

**Files:**
- Create: `deploy/backup/verify-backup.sh`
- Create: `deploy/backup/restore-application-db-rehearsal.sh`
- Create: `deploy/backup/restore-drupal-rehearsal.sh`

- [ ] Verify all checksums before restore.
- [ ] Require explicit non-production confirmation.
- [ ] Guard application database target naming against production restoration.
- [ ] Restore Drupal to an isolated Compose project and verify service health.

### Task 4: Operational governance

**Files:**
- Create: `docs/operations/backup-disaster-recovery.md`
- Create: `docs/operations/rpo-rto-decision-record.md`
- Create: `docs/operations/restore-rehearsal-evidence-template.md`
- Modify: `docs/DEPLOYMENT_UBUNTU_24_04.md`
- Modify: `docs/OWC_TASK_STATUS.md`

- [ ] Document component inventory, restore order, CPPS reconciliation and secret boundary.
- [ ] Add explicit unapproved RPO/RTO decision record rather than guessed targets.
- [ ] Add restore rehearsal evidence template and production acceptance gates.

### Task 5: CI and acceptance evidence

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `docs/verification/backup-dr-tdd.md`

- [ ] Add shell syntax validation only; do not run live backup/restore in CI.
- [ ] Run exact-head tests/lint/build and Drupal clean-room reconstruction.
- [ ] Preserve as a stacked draft PR on the reference-CPPS branch.
