# OWC Backup / Disaster Recovery TDD Evidence

## Scope

Branch: `feature/backup-disaster-recovery-readiness`

This evidence covers repository-side backup-set creation, integrity verification and explicitly non-production restore-rehearsal safeguards. It does **not** claim that OWC production provider backups, PITR, off-host retention or a production-like restore exercise have been activated.

## RED 1 — recovery tooling absent

- CI run: `34758974180`
- Test commit: `22952698c402ad4667366aa1ef241738c37ee105`
- Result: expected failure.
- Baseline: 134 pre-existing tests passed.
- New failures: six backup/DR contract tests, all caused by the required recovery scripts not yet existing.

The failing contract required:

- fail-fast/private shell behavior;
- application PostgreSQL dump without URI/secret embedding;
- Drupal DB + public-media backup without settings secrets;
- operator-provided evidence export;
- manifest/release metadata + SHA-256 verification;
- non-production restore guardrails and no CPPS/payment replay.

## RED 2 — post-restore health requirement

- CI run: `34759260616`
- Test commit: `62cd248abe3d2351990ba250a0682f80957bcbef`
- Result: expected failure.
- 139 tests passed and only two assertions failed.

The two failures were narrowly scoped:

1. the release SHA used an equivalent `git -C ... rev-parse HEAD` spelling while the contract required the explicit repository-context `git rev-parse HEAD` form;
2. the Drupal restore rehearsal did not yet prove the reconstructed CMS served successfully.

The implementation was then changed to record the release SHA from the repository working directory and execute an isolated Drupal `curl -fsS http://localhost/` health check after restoring DB/media.

## GREEN acceptance criteria

The exact final branch head must demonstrate:

- all Bun tests green;
- lint/type-check green;
- Next.js production build green;
- shell syntax validation for all `deploy/backup/*.sh` scripts;
- Drupal clean-room reconstruction green;
- Ubuntu production deployment skipped because the feature branch is not `main`.

## External acceptance remaining

Repository GREEN is not production DR acceptance. OWC still needs:

- approved RPO/RTO;
- production backup/PITR schedule and retention;
- evidence-storage backup/export policy respecting legal hold/privacy;
- logically separate/off-host copy;
- backup-failure monitoring/alerting;
- successful restore rehearsal in an approved isolated environment;
- CPPS reconciliation against an approved non-production CPPS interface;
- remediation/sign-off from business, technical and security owners.
