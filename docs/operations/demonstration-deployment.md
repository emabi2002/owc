# OWC Demonstration Deployment Runbook

## Purpose

This runbook packages the OWC presentation environment as an explicitly synthetic demonstration/reference deployment. It does **not** claim that a public presentation host, OWC production environment, government agency endpoint, financial institution or payment gateway is connected.

Until the GitHub deployment secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` and `DEPLOY_SSH_KEY` are supplied for a dedicated presentation server, the deployment state is:

**DEMO HOST EXTERNAL**

The CI workflow deliberately treats that state as a safe deployment skip while continuing to verify the application, reference UAT and Drupal clean-room build.

## Demonstration environment profile

Configure these values in the dedicated non-production presentation environment:

```env
OWC_IDENTITY_MODE=demonstration
OWC_ENABLE_DEMO_RESET=true
OWC_ENABLE_REFERENCE_ECOSYSTEM=true
OWC_ENABLE_SANDBOX=true
OWC_ENABLE_REFERENCE_MALWARE_SCANNER=true
OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY=true
OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY=true
```

Also configure server-side demonstration credentials:

- `OWC_DEMO_SESSION_SECRET` — random value of at least 32 characters;
- `OWC_DEMO_PASSWORD` — presentation-only password of at least 12 characters;
- `OWC_DEMO_MFA_CODE` — six-digit presentation-only MFA value.

Do not publish those values in screenshots, documentation, browser JavaScript or the repository.

## Payment boundary

Payment is **simulation-only** under the approved demonstration scope. The application generates synthetic `SIM-PAY-...` and `SIM-RCPT-...` records containing `simulation: true` and `moneyMovement: false`.

`OWC_PAYMENT_API_BASE_URL` and `OWC_PAYMENT_API_KEY` must remain unset. The demonstration does not call a bank API or payment gateway and cannot move real funds.

## Preflight

From the application checkout:

```bash
bun run demo:preflight
```

The preflight checks only the presence/shape or exact safe values of the demonstration settings. It never prints the session secret, password, MFA value, API keys or environment dump.

A non-zero exit means the presentation profile must not be started or deployed until the reported configuration problem is corrected.

## Dedicated Ubuntu presentation host

When a host is supplied, configure the existing GitHub deployment secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- optionally `DEPLOY_PORT` (defaults to 22)

The host should be dedicated to OWC demonstration/UAT, run the existing Ubuntu/PM2/Nginx baseline, keep runtime secrets outside Git, and expose HTTPS using the agreed demonstration hostname. It must not be an NJSS environment or an unapproved OWC production host.

The existing GitHub workflow then calls `deploy/release.sh`, which uses a fast-forward release, production build, PM2 reload, health verification and code rollback if the new revision is unhealthy.

## Presentation preparation

1. Verify the target release SHA has green application/security/reference-UAT/build CI and green Drupal clean-room reconstruction.
2. Run `bun run demo:preflight` on the presentation host.
3. Start/reload the application with the demonstration environment profile.
4. Confirm `/api/health`, `/api/integrations/health`, `/admin/integrations` and `/admin/integrations/process` are reachable as appropriate.
5. Use the guarded whole-demonstration reset before rehearsal/presentation.
6. Confirm synthetic evidence, scanner, notifications and external-service replicas are available.
7. Run the presentation-level demonstration UAT/rehearsal package.
8. Confirm every generated payment remains simulation-only with `moneyMovement: false`.

## Production boundary

This package is not a production cutover. Real IdP, CPPS, evidence storage, malware scanning, notification providers and authorized external agency services remain post-award/live-migration work where applicable. Payment is an exception: it remains simulation-only unless a separate future scope explicitly authorizes a new financial integration design.
