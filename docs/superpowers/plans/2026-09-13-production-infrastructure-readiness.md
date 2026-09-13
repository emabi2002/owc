# OWC Production Infrastructure Readiness Implementation Plan

**Goal:** Harden the existing Ubuntu 24.04 production deployment path so a release is preflighted, smoke-tested, recoverable and operationally verifiable without claiming that OWC production infrastructure has already been provisioned.

**Architecture:** Preserve the existing Ubuntu + Nginx + PM2/systemd deployment model and CI clean-room gates. Move remote release behavior into a repository-owned deployment script, require a clean working tree, retain the previous application SHA, perform a local health check after reload, and automatically restore the previous application revision if the new release fails its smoke check. External DNS, TLS issuance, hosts, secrets and managed services remain provisioning dependencies.

## Task 1 — Transactional application release script

- [ ] Add a failing contract test covering clean-tree preflight, previous-SHA capture, `/api/health` smoke check and rollback.
- [ ] Add `deploy/release.sh` implementing fast-forward release, deterministic install/build, PM2 reload/start, bounded health retries and application rollback.
- [ ] Update GitHub Actions SSH deployment to execute the repository-owned release script.
- [ ] Update Ubuntu deployment documentation with smoke/rollback behavior and limitations.
- [ ] Verify focused test, full Bun tests, lint/type-check and build.

## Task 2 — Production environment/preflight acceptance

- [ ] Add a server-side production-readiness/preflight report that distinguishes mandatory app configuration from externally blocked integrations without printing secrets.
- [ ] Document exact production secret/configuration ownership and validation procedure.
- [ ] Add tests proving missing critical configuration cannot be reported ready.

## Task 3 — Monitoring and operational hooks

- [ ] Reconcile `/api/health` and operational-readiness checks for external monitoring.
- [ ] Document minimum uptime, log, alert and escalation hooks without binding OWC to an unapproved commercial monitoring provider.
- [ ] Ensure health output never discloses credentials or sensitive claimant data.

## Task 4 — Verification and handoff

- [ ] Run exact-head CI including Drupal clean-room reconstruction.
- [ ] Record verification evidence.
- [ ] Open a layered draft PR against `feature/production-integration-hub` only after the exact branch head is green.

## External acceptance boundary

This work does not provision or assert a live OWC production host, DNS, TLS certificate, Supabase project/storage, malware scanner, notification gateway, CPPS endpoint, identity provider or government-agency API. Those remain separately tracked production-cutover gates.
