# OWC Drupal Enterprise CMS

This directory runs the OWC headless Drupal CMS for DEV/UAT and deployment validation. Drupal owns editorial/public content; Next.js remains the digital experience layer. Claims, restricted evidence, banking information, and compensation/payment records remain outside Drupal.

## Configuration source of truth

The version-controlled configuration in `drupal/config/sync` is the authoritative OWC CMS configuration baseline. It contains the content types, fields, editorial workflow, roles, permissions, views, and supporting Drupal configuration required to reconstruct the CMS.

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

## Verification

The verification script confirms Drupal/database bootstrap, required enterprise modules, all OWC editorial content types, governance roles, and the `owc_editorial` workflow.

```bash
docker compose exec drupal /opt/owc-drupal/scripts/verify.sh
docker compose exec drupal vendor/bin/drush config:status
```

`config:status` should report no differences between the active database configuration and the sync directory after an approved configuration export/import cycle.

GitHub Actions also performs an isolated clean-room reconstruction on the Drupal feature branch: it creates fresh Docker volumes, installs Drupal from the committed configuration, runs verification, runs bootstrap a second time to prove idempotency, and then destroys the isolated CI stack.

## Configuration changes

Make approved CMS configuration changes through Drupal, validate them, export the active configuration, review the generated YAML, and commit the intended configuration changes. Do not treat manual runtime changes as durable until they are represented in `drupal/config/sync` and verified.

Do not add secrets, passwords, API keys, database credentials, or environment-specific private values to the configuration export.

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
