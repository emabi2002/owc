# OWC Drupal Enterprise CMS Integration

## Purpose

Drupal is the enterprise editorial content system for the OWC platform. Next.js remains the digital experience and application layer; Supabase/PostgreSQL remains the portal identity, claims-support and audit data store; CPPS remains the authoritative claims/payment system until formal discovery establishes otherwise.

## Runtime selection

Configure:

```env
DRUPAL_BASE_URL="https://cms.owc.gov.pg"
DRUPAL_API_TOKEN=""
OWC_CONTENT_SOURCE="auto"
```

`auto` prefers Drupal when `DRUPAL_BASE_URL` is present, otherwise it retains the current Supabase content source. `supabase` forces the migration fallback. `drupal` selects Drupal when configured. This supports a controlled migration without breaking the existing public portal.

## Drupal content types

Create the following machine-name content types:

| Editorial domain | Drupal machine name | Principal fields |
| --- | --- | --- |
| News / notices | `news` | category, excerpt, body, image, featured |
| Forms | `form` | code, category, file format, file size, file URL |
| Reports | `report` | year, description, file size, file URL |
| FAQs | `faq` | question/title, answer, category, sort order |
| Publications | `publication` | category, description, year, format, size, file URL |
| Legislation | `legislation` | reference, category, description, enacted year, file URL |
| Tenders | `tender` | reference, category, description, tender status, published date, closing date, file URL |
| General pages | `page` | body, service/category taxonomy, navigation metadata |

Field machine names used by the Next.js adapter follow the `field_*` names in `src/lib/drupal/content.ts`. They can be changed through the adapter if the final Drupal build uses different machine names.

## Editorial workflow

Recommended moderation states:

`Draft -> Review -> Approved -> Published -> Archived`

Recommended roles:

- CMS Administrator
- Content Author / Editor
- Reviewer
- Publisher / Approver
- Auditor / Read-only

Only published Drupal nodes are requested through JSON:API (`filter[status]=1`). Restricted claims, medical evidence, banking information and compensation documents must not be stored in Drupal.

## API boundary

The Next.js application calls Drupal JSON:API through the server-side adapter in `src/lib/drupal/client.ts`. The adapter:

- normalizes base URLs;
- filters for published content;
- supports sort and page limits;
- sends `Accept: application/vnd.api+json`;
- optionally sends a bearer token;
- uses a 60-second revalidation window;
- maps Drupal nodes into the existing OWC UI domain types.

This lets the public website move to Drupal without redesigning the user interface.

## Step 1 implementation assets

The repository now contains a repeatable DEV/UAT Drupal provisioning package under `drupal/`:

- `drupal/docker-compose.yml` — Drupal 11 plus PostgreSQL 16 with persistent site/database volumes and health checks.
- `drupal/Dockerfile` — Drupal image with Composer and Drush.
- `drupal/manifest.json` — canonical content types, field groups, moderation states and roles used by CI and bootstrap tooling.
- `drupal/scripts/bootstrap.sh` — installs Drupal when required, enables JSON:API/workflow/media modules and runs deterministic provisioning.
- `drupal/scripts/provision.php` — creates the eight editorial content types, fields, workflow and editorial roles idempotently.
- `drupal/scripts/sample-content.php` — creates safe representative public records for DEV/UAT only when absent.
- `drupal/scripts/verify.sh` — verifies Drupal bootstrap, core modules, content types, roles and workflow.
- `docs/DRUPAL_STEP1_ACCEPTANCE.md` — separates repository-complete work from real infrastructure prerequisites.

Provision DEV/UAT with:

```bash
cd drupal
cp .env.example .env
# Replace example credentials first.
docker compose up -d --build
docker compose exec drupal /opt/owc-drupal/scripts/bootstrap.sh
docker compose exec drupal /opt/owc-drupal/scripts/sample-content.sh
docker compose exec drupal /opt/owc-drupal/scripts/verify.sh
```

These assets do not by themselves constitute a production deployment. A real approved DEV/UAT host, DNS/TLS, secure secrets, backups/monitoring and editorial identity/MFA are still required before operational acceptance.

## Migration sequence

1. Provision Drupal in DEV/UAT.
2. Create content types, taxonomies, moderation workflow and roles.
3. Enable JSON:API and security controls.
4. Import a representative content subset from Supabase.
5. Configure `DRUPAL_BASE_URL` in UAT and verify the Next.js portal reads Drupal content.
6. Reconcile record counts, slugs, attachments and published status.
7. Migrate remaining editorial records.
8. Freeze Supabase editorial writes.
9. Switch `OWC_CONTENT_SOURCE=drupal`.
10. Retain the old content tables temporarily for rollback, then formally decommission them after acceptance.

## Production controls

- Drupal administration should be behind MFA and role-based access.
- JSON:API should expose only fields required by the public experience.
- Public content APIs must not expose unpublished revisions or authoring metadata unnecessarily.
- Media intended for public download can be served through Drupal; restricted claim evidence remains in the secure claims evidence repository.
- Configuration, modules and schema changes should be promoted DEV -> UAT -> PROD through controlled deployment, not edited directly in production.
