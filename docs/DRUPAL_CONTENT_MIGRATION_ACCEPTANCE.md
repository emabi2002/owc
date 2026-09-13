# OWC Drupal Content Migration Acceptance

## Scope

This work package migrates OWC public/editorial content into Drupal 11 and establishes Drupal as the authoritative public CMS through the existing Next.js content boundary.

Covered editorial bundles are:

- news
- page
- form
- report
- faq
- publication
- legislation
- tender

Restricted claimant evidence, medical records, compensation documents, banking information, payment records and CPPS operational data remain outside Drupal.

## Migration controls

The migration path uses a canonical JSON document with deterministic record keys and source workflow-state mapping. The exporter prefers configured privileged Supabase content and otherwise uses the repository reference content set. The Drupal importer upserts by deterministic migration UUID, preserves moderation state, and is safe to run repeatedly.

`source_*` values are transport/source metadata. They are not written as Drupal entity fields and are excluded from Drupal-field parity comparisons. Unknown non-metadata Drupal fields remain validation failures.

## Runtime authority

`OWC_CONTENT_SOURCE=drupal` makes Drupal authoritative for public content and does not silently fall back to Supabase if Drupal is unavailable. Transitional/rollback behavior remains explicitly selectable through the configured content-source policy.

Drupal credentials remain server-side and are not exposed to browser code.

## Verified clean-room gate

Branch head `95e1102f41166b2482f884bb1169a7544f2e96c1` was verified by GitHub Actions run `34750465952`.

The following checks completed successfully in that run:

- Bun tests
- TypeScript type-check and lint gate
- Next.js production build
- canonical reference-content export
- Drupal migration shell validation
- isolated Drupal/PostgreSQL image build
- clean-room Drupal reconstruction from committed configuration
- first canonical content import
- second import proving idempotency
- source-to-Drupal content parity verification
- reconstructed CMS verification
- second bootstrap proving bootstrap idempotency
- isolated environment teardown

The repository reference export contained 50 public/editorial records across FAQ, form, legislation, news, publication, report and tender bundles. Page migration remains supported by the canonical contract and importer for configured source content.

## Deployment boundary

This acceptance proves repository-level and isolated clean-room reproducibility. It does not claim that an OWC government DEV/UAT or production Drupal host has been provisioned.

Before production cutover, OWC still requires an approved hosting environment, DNS/TLS, production secrets, backup and monitoring, an agreed editor identity/MFA mechanism, and a production content reconciliation/export using the approved source dataset.

## Acceptance decision

The Drupal content-migration work package is accepted at repository/CI level when the branch-head clean-room workflow is green and no source-to-Drupal parity discrepancies are reported. Production deployment remains a separate controlled work package.
