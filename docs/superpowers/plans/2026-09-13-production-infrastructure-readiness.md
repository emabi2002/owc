# OWC Production Infrastructure Readiness Implementation Plan

**Goal:** Harden the existing Ubuntu 24.04 production deployment path so a release is preflighted, smoke-tested, recoverable and operationally verifiable without claiming that OWC production infrastructure has already been provisioned.

**Architecture:** Preserve the existing Ubuntu + Nginx + PM2/systemd deployment model and CI clean-room gates. Move remote release behavior into a repository-owned deployment script, require a clean working tree, retain the previous application SHA, perform a local health check after reload, and automatically restore the previous application revision if the new release fails its smoke check. External DNS, TLS issuance, hosts, secrets and managed services remain provisioning dependencies.

## Task 1 — Transactional application release script

- [x] Add a contract test covering clean-tree preflight, previous-SHA capture, `/api/health` smoke check and rollback.
- [x] Add `deploy/release.sh` implementing fast-forward release, deterministic install/build, PM2 reload/start, bounded health retries and application rollback.
- [x] Update GitHub Actions SSH deployment to execute the repository-owned release script.
- [x] Update Ubuntu deployment documentation with smoke/rollback behavior and limitations.
- [ ] Verify the final exact-head focused/full tests, lint/type-check, build and Drupal clean-room run.

## Task 2 — Production environment/preflight acceptance

- [x] Add a server-side production-readiness/preflight report that distinguishes mandatory app configuration from externally blocked integrations without printing secrets.
- [x] Integrate the preflight into the authenticated System Readiness administration view and remove the misleading implication that base configuration alone equals production acceptance.
- [x] Document production secret/configuration ownership and validation boundaries in the Ubuntu deployment runbook.
- [x] Add tests proving missing critical configuration cannot be reported ready and that secret values are never projected into the report.

## Task 3 — Monitoring and operational hooks

- [x] Reconcile `/api/health` and operational-readiness boundaries for external monitoring; keep the public health response shallow and non-sensitive.
- [x] Add `deploy/monitor-check.sh` for PM2 process, local health, optional public HTTPS smoke and disk-threshold checks.
- [x] Add automated contract tests for the host monitoring script.
- [x] Document minimum availability, logging, alert and escalation hooks without binding OWC to an unapproved commercial monitoring provider.
- [x] Ensure health/monitoring output never enumerates environment variables or discloses credentials/claimant data.
- [x] Add CI shell-syntax validation for deployment/monitoring scripts.

## Task 4 — Verification and handoff

- [ ] Run exact-head CI including Drupal clean-room reconstruction.
- [ ] Record verification evidence.
- [ ] Open a layered draft PR against `feature/production-integration-hub` only after the exact branch head is green.

## External acceptance boundary

This work does not provision or assert a live OWC production host, DNS, TLS certificate, Supabase project/storage, malware scanner, notification gateway, CPPS endpoint, identity provider or government-agency API. Those remain separately tracked production-cutover gates.
