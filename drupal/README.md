# OWC Drupal Enterprise CMS

This directory provisions the OWC headless Drupal CMS for DEV/UAT. Drupal owns editorial/public content; Next.js remains the experience layer. Claims, restricted evidence, banking information and compensation/payment records remain outside Drupal.

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
