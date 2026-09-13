# OWC Drupal Step 1 Acceptance

## Repository-complete capabilities

The Drupal implementation branch contains a repeatable DEV/UAT stack using Drupal 11 and PostgreSQL 16, a Drush-based bootstrap path, the eight required editorial content types, the OWC moderation workflow, least-privilege editorial roles, JSON:API enablement, sample public content tooling, and verification scripts.

## Content boundary

Drupal is limited to public/editorial content. Claims, medical evidence, banking information, compensation documents and payment records remain outside Drupal. Next.js remains the public experience layer and consumes Drupal through the existing server-side adapter.

## Provisioning commands

```bash
cd drupal
cp .env.example .env
# Replace all placeholder credentials before use.
docker compose up -d --build
docker compose exec drupal /opt/owc-drupal/scripts/bootstrap.sh
docker compose exec drupal /opt/owc-drupal/scripts/sample-content.sh
docker compose exec drupal /opt/owc-drupal/scripts/verify.sh
```

## UAT connection

Configure the Next.js application only after Drupal verification passes:

```env
DRUPAL_BASE_URL="https://cms.owc.gov.pg"
DRUPAL_API_TOKEN=""
OWC_CONTENT_SOURCE="auto"
```

Keep `auto` during migration. Change to `drupal` only after content counts, slugs, attachments and published status have been reconciled.

## External prerequisites still required

Repository work does not itself create a real government DEV/UAT environment. Before Drupal can be called deployed, OWC still needs an Ubuntu/Docker host or approved container platform, DNS for the CMS hostname, TLS certificate/reverse proxy, production-grade secrets, backup/monitoring integration and an agreed identity/MFA mechanism for editors.

## Acceptance rule

Do not describe Drupal as production-deployed until the commands above have been executed on an approved DEV/UAT host and the verification script, JSON:API checks and Next.js content reads have been observed successfully.
