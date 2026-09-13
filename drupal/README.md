# OWC Drupal Enterprise CMS

This directory runs the OWC headless Drupal CMS for DEV/UAT and deployment validation. Drupal owns editorial/public content; Next.js remains the digital experience layer. Claims, restricted evidence, banking information, and compensation/payment records remain outside Drupal.

## Configuration source of truth

The version-controlled configuration in `drupal/config/sync` is the authoritative OWC CMS configuration baseline. It contains the content types, fields, editorial workflow, roles, permissions, views, OpenID Connect role mappings, and supporting Drupal configuration required to reconstruct the CMS.

For a fresh database, `scripts/bootstrap.sh` points Drupal at `/opt/drupal/config/sync` and installs the site with `drush site:install --existing-config`. For an existing installation, bootstrap does not reinstall Drupal; it rebuilds caches and checks that active configuration remains aligned with the committed baseline.

`scripts/provision.php` is retained as a development/recovery utility. It is not executed during normal bootstrap because the committed YAML configuration is the production configuration source of truth.

## Start DEV/UAT

```bash
cd drupal
cp .env.example .env
# Replace all example secrets before starting.
docker compose up -d --build
docker compose exec drupal /opt/owc-drupal/scripts/bootstrap.sh
docker compose exec drupal /opt/owc-drupal/scripts/verify.sh
```

Drupal is exposed at `http://localhost:8088` by default. Change `DRUPAL_HTTP_PORT` for the target environment.

## Drupal editor identity and MFA

OWC CMS editors authenticate through an external OpenID Connect identity provider. MFA is enforced by that identity provider; Drupal does not maintain a second independent MFA database. The five managed IdP groups map to the existing least-privilege Drupal roles:

- `owc-cms-administrators` → `cms_administrator`
- `owc-content-editors` → `content_editor`
- `owc-reviewers` → `reviewer`
- `owc-publishers` → `publisher`
- `owc-auditors` → `auditor`

Register the Drupal generic OpenID Connect callback URL in the DEV/UAT identity provider, then place the provider endpoints and client credentials in `.env` or the approved deployment secret store. Do not commit the real client secret.

Required runtime values are `OWC_OIDC_CLIENT_ID`, `OWC_OIDC_CLIENT_SECRET`, `OWC_OIDC_AUTHORIZATION_ENDPOINT`, `OWC_OIDC_TOKEN_ENDPOINT`, and `OWC_OIDC_USERINFO_ENDPOINT`. `OWC_OIDC_END_SESSION_ENDPOINT` is optional.

After the IdP registration is available:

```bash
docker compose exec drupal /opt/owc-drupal/scripts/configure-identity.sh
docker compose exec drupal /opt/owc-drupal/scripts/verify-identity.sh
```

Keep `OWC_IDENTITY_ENFORCE_SSO=0` while validating the IdP client, MFA, role mappings, logout and role revocation. After successful DEV/UAT verification, set `OWC_IDENTITY_ENFORCE_SSO=1` and restart/recreate the Drupal container so the runtime policy receives the new environment setting.

Normal local username/password login is denied while SSO enforcement is active. UID 1 is recovery-only and is permitted locally only when both SSO enforcement and `OWC_BREAK_GLASS_LOCAL_LOGIN=1` are active. Enable that switch only for an authorized recovery event, record the change, complete the recovery, then return it to `0` immediately. The break-glass password is never stored in repository configuration.

Identity events are written to Drupal's logging subsystem. Production operations must forward those logs to the approved central logging/SIEM service.

## Verification

The base verification script confirms Drupal/database bootstrap, required enterprise modules, all OWC editorial content types, governance roles, and the `owc_editorial` workflow. Identity readiness separately verifies the OIDC modules, OWC group mappings and runtime enforcement posture.

```bash
docker compose exec drupal /opt/owc-drupal/scripts/verify.sh
docker compose exec drupal /opt/owc-drupal/scripts/verify-identity.sh
docker compose exec drupal vendor/bin/drush config:status
```

`config:status` should report no differences between the active database configuration and the sync directory after an approved configuration export/import cycle.

GitHub Actions performs an isolated clean-room reconstruction on the Drupal feature branches: it creates fresh Docker volumes, installs Drupal from committed configuration, migrates public content, verifies migration idempotency/parity, verifies Drupal editor identity readiness in non-enforcing mode, runs the CMS checks, proves bootstrap idempotency, and then destroys the isolated CI stack.

## Configuration changes

Make approved CMS configuration changes through Drupal, validate them, export the active configuration, review the generated YAML, and commit the intended configuration changes. Do not treat manual runtime changes as durable until they are represented in `drupal/config/sync` and verified.

Do not add secrets, passwords, API keys, database credentials, OIDC client secrets, or environment-specific private values to the configuration export.

## Operations

```bash
docker compose logs -f drupal
docker compose stop
docker compose down
```

To destroy DEV data intentionally:

```bash
docker compose down -v
```

Do not use the volume-destroy command in UAT/production without a verified backup and explicit change approval.

## Next.js connection

After Drupal is reachable, configure the portal:

```env
DRUPAL_BASE_URL="https://cms.owc.gov.pg"
DRUPAL_API_TOKEN=""
OWC_CONTENT_SOURCE="auto"
```

Use `OWC_CONTENT_SOURCE=drupal` only after UAT content reconciliation succeeds.
