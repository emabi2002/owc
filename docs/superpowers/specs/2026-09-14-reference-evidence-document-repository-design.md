# OWC Reference Evidence & Document Repository — Design

**Date:** 14 September 2026
**Programme task:** Task 2 — Working reference evidence/document repository
**Status:** Approved under the existing uninterrupted implementation mandate

## Purpose

Provide a credible, working evidence/document repository for the OWC demonstration environment without pretending that a production object-storage service, production retention platform, or real claimant document archive is connected.

The repository reuses the existing OWC claim-evidence controls: claim-scoped upload authorization, file-type/size validation, safe storage paths, SHA-256 integrity, malware-scan state, review workflow, retention metadata and legal hold. It does not introduce a competing evidence model.

## Architectural boundary

Production evidence storage remains an external/live dependency configured after award. The reference repository is an explicit demonstration adapter and never activates merely because live storage fails.

Selection rules:

1. A configured live evidence repository remains authoritative.
2. The reference repository is used only when an explicit reference/demo flag enables it.
3. If neither is configured, evidence storage fails closed.

Reference health/capability responses identify `source: reference`, `productionConnected: false`, and `durable: false`.

## Data model

Reuse `ClaimEvidence` metadata and existing evidence categories. A reference repository object contains deterministic object ID, claim reference, category/title, safe file name/MIME type, byte length, upload actor/time, SHA-256 digest, review status, scan status, optional retention-review date, legal-hold flag, and process-local synthetic bytes.

Committed fixtures contain no real claimant, medical, banking, identity or employer data.

## Required behaviour

### Claim isolation

Reads and writes are claim-scoped. A document identifier from claim A cannot be retrieved through claim B. Existing safe-path normalization is reused; filesystem paths and path traversal are never accepted as locators.

### Upload/register

A reference upload validates file type/size using existing policy, computes SHA-256 over actual bytes, generates an immutable reference identity and safe storage path, defaults to `Pending Review`, records scan state, and never claims durability beyond the running demonstration process. Existing public claim-scoped upload-token controls remain applicable.

### Retrieval/download

Metadata listing is claim-scoped. Byte retrieval requires an exact claim/object match. Infected evidence is never downloadable. Where scanning is mandatory, unavailable scan state is also withheld. Integrity can be rechecked against stored SHA-256.

### Review/governance

Reuse the existing rule: only `Pending Review` can become `Verified` or `Rejected`. Legal hold blocks destructive retention action. Task 2 does not invent a statutory retention period.

### Access model

- Administrator: all repository staff functions.
- Claims Officer: claim-evidence access and review/manage.
- Assessment Officer: evidence read access needed for assessment, no evidence-management authority.
- Finance/Payment Officer: Task 2 adds no blanket medical-document access.
- Content Editor: no claim-evidence access.
- Claimant/employer submission remains claim-scoped rather than staff-role based.

## Reference HTTP facade

Reference-only routes are disabled by default and non-disclosing while disabled. They may expose health/capability, claim-scoped listing, controlled reference upload, and claim/object download. They must never expose repository-wide enumeration, arbitrary files, filesystem paths, credentials, or service-role keys.

## Security/privacy

No real PII/medical/banking material; no credentials in source/browser payloads; type/size validation; malware state enforced before download; SHA-256 integrity retained; telemetry metadata only; process-local bytes explicitly non-durable; production storage separately configured and accepted.

## Demonstration narrative

The Department can see synthetic evidence submitted into a claim-scoped repository, integrity/scan metadata recorded, a Claims Officer review it, an Assessment Officer read safe evidence, and cross-claim/unsafe access denied. Every reference surface is labelled as demonstration/reference rather than production.

## Completion boundary

Task 2 is repository-complete when reference repository behaviour, API boundary, tests, documentation and exact-head CI are green. Production storage-provider configuration, approved retention policy, real scanner acceptance and real document migration remain external/post-award activities.
