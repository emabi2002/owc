# OWC Drupal Content Migration and Authoritative Cutover Design

## Purpose
Move OWC public/editorial content from the transitional Supabase/local-seed model into Drupal and make Drupal the authoritative public CMS while preserving a controlled rollback path during migration.

## Scope
The migration covers the eight Drupal content types established in Step 1: `news`, `page`, `form`, `report`, `faq`, `publication`, `legislation`, and `tender`.

The existing OWC application already prefers Drupal when configured and falls back to Supabase/local seed content when Drupal is unavailable. This work package will populate Drupal deterministically, validate parity, and then change production policy from transitional fallback to Drupal-authoritative operation.

## Source precedence during migration
1. Existing Supabase editorial/public-content tables when configured and accessible.
2. Repository seed/reference content for records not present in Supabase or for repeatable non-production verification.
3. Drupal becomes the target system of record after validation and cutover.

Claims, claimant evidence, staff authentication, CPPS data and audit records are explicitly outside this content migration.

## Canonical migration model
Migration uses a canonical intermediate JSON document rather than coupling Drupal directly to Supabase. The exporter normalizes source records into content-type-specific payloads. The Drupal importer consumes that canonical document.

Each record has:
- `sourceType`: source collection/table name.
- `sourceId`: stable source identifier.
- `contentType`: target Drupal bundle.
- `key`: deterministic natural key used for idempotent upsert.
- `status`: draft/review/approved/published/archived mapping.
- `attributes`: normalized Drupal field values.

Natural keys:
- news: source ID, with slug retained as migration metadata.
- page: source ID/slug.
- form: form code.
- report: source ID; title + year used as secondary check.
- faq: source ID; question used as secondary check.
- publication: source ID; title + year secondary check.
- legislation: reference where present, otherwise source ID.
- tender: tender reference.

## Workflow mapping
Existing Supabase statuses map to Drupal OWC editorial states:
- `draft` → `draft`
- `submitted` → `review`
- `approved` → `approved`
- `published` → `published`
- `archived` → `archived`

The importer must never silently publish a non-published source record.

## Import behavior
The importer is repeatable and idempotent:
- existing records are matched by deterministic migration key/natural key;
- rerunning updates the existing node instead of creating duplicates;
- unknown content types or malformed records fail the migration command;
- import output reports created, updated, skipped and failed counts per bundle;
- restricted claim evidence is never imported into Drupal.

## Public-content cutover
Next.js continues to consume Drupal only through `src/lib/drupal/*`; browsers/mobile clients do not call Drupal directly.

Migration phases:
1. **Shadow:** Drupal populated while Supabase fallback remains enabled.
2. **Parity validation:** compare record counts and representative records across all bundles.
3. **Authoritative:** production `CONTENT_SOURCE=drupal`; Drupal failures return a controlled content-service error rather than silently reverting to an obsolete primary CMS.
4. **Rollback window:** fallback can temporarily be re-enabled by explicit configuration during cutover only.
5. **Retirement:** Supabase editorial tables cease being the primary CMS after acceptance.

## Validation criteria
Before authoritative cutover:
- all eight configured Drupal bundles are present;
- canonical export completes without malformed records;
- import completes without failures;
- rerunning the same import creates zero duplicates;
- source/target counts reconcile or every variance is documented;
- representative news, forms, reports, FAQs, publications, legislation and tenders render correctly through Next.js;
- editorial states are preserved;
- JSON:API returns only intended public content to anonymous consumers;
- CI tests, type-check/lint and production build are green.

## Security and governance
- No service secret is exposed to browser code.
- Drupal write credentials remain server/container-only.
- Public JSON:API is read-only for anonymous consumers.
- CMS roles/workflow from Step 1 remain the editorial authorization boundary.
- Migration logs must not contain secrets or restricted claimant information.

## Out of scope / external dependencies
- Production CPPS connectivity.
- Production evidence object storage and malware scanning.
- Government identity/business/payment/medical integrations.
- Final SSO/federation design for CMS administrators/editors.
- Production hosting/DNS/TLS cutover.
