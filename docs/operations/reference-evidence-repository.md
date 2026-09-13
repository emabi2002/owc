# OWC Reference Evidence Repository

## Purpose

This runbook covers the **reference evidence/document repository** used only for controlled OWC development, UAT and Department demonstrations. It is synthetic, process-local and **non-durable**. It is not the production claimant document archive and it does not prove that a production object-storage provider or malware-scanning service is connected.

## Enablement

The repository is disabled by default.

```text
OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY="false"
```

For an approved controlled demonstration environment only, set it to `"true"`. Production environments must use the approved live evidence repository and should keep this reference flag disabled.

The existing live claimant upload route continues to require its normal Supabase/object-storage and security configuration. A live storage failure does **not** fall back to the reference repository.

## What the reference repository demonstrates

- claim-scoped evidence storage and listing;
- supported file-type and 20 MB validation;
- safe claim/object/file storage paths;
- SHA-256 integrity metadata;
- synthetic scan-state handling;
- Claims Officer review workflow;
- Assessment Officer read-only access;
- legal-hold and retention-review metadata;
- cross-claim object isolation;
- explicit non-production and non-durable labelling.

Committed fixture bytes contain only synthetic demonstration text and no real claimant, medical, banking, identity or employer records.

## Access control

The Task 1 identity model governs staff access:

| Role | Evidence access |
| --- | --- |
| Administrator | View and manage |
| Claims Officer | View and manage/review |
| Assessment Officer | View only |
| Finance / Payment Officer | No blanket evidence access |
| Content Editor | No claim-evidence access |
| Reviewer / Viewer | No claim-evidence access |

Claimant/employer public submission remains governed by the separate short-lived claim-scoped upload-token flow. The reference staff API is not a replacement for that public authorization boundary.

## Reference API boundary

When the flag is disabled, reference routes return a non-disclosing `404`.

When enabled:

- `GET /api/reference/evidence/health` — reference capability metadata;
- `GET /api/reference/evidence/claims/<claim-reference>` — staff claim-scoped metadata listing;
- `POST /api/reference/evidence/claims/<claim-reference>` — staff-controlled multipart reference upload;
- `GET /api/reference/evidence/claims/<claim-reference>/<object-id>` — exact claim/object download when safe.

The facade never accepts a filesystem path and never exposes repository-wide enumeration, credentials, service-role keys or arbitrary file access.

### Synthetic scan state

The reference upload endpoint can accept a `syntheticScanState` solely to demonstrate clean/infected/unavailable/not-configured behaviour. The API response explicitly states that this is synthetic demonstration metadata. It must never be presented as the output of a real malware scanner.

Infected evidence is not downloadable. If `OWC_REQUIRE_MALWARE_SCAN=true`, evidence whose scan state is unavailable or not configured is also withheld.

## Legal hold and retention

The reference repository preserves `legalHold` and optional retention-review metadata. **No statutory retention period is invented by this implementation.** Production retention dates and destruction rules require an approved OWC records-retention policy.

A legal hold must prevent destructive retention action. Task 2 deliberately provides no automatic deletion function.

## Reset

The reference repository is process-local. Application restart naturally removes transient uploads. Automated tests and controlled demonstrations may call the repository reset helper to restore the deterministic synthetic fixture state.

Because the store is non-durable, it is unsuitable for production evidence, disaster-recovery claims or records-retention compliance.

## Production migration boundary

After award, the reference adapter is replaced or bypassed by the approved live storage implementation. Production acceptance requires, at minimum:

1. approved private object-storage provider and bucket/container configuration;
2. production identity/RBAC validation;
3. real malware-scanner connectivity and fail-closed policy approval;
4. approved retention/legal-hold policy and operational procedure;
5. encryption, backup/DR and monitoring evidence for the live repository;
6. real-document migration plan, reconciliation and acceptance where migration is required;
7. security/UAT evidence demonstrating claimant privacy and cross-claim isolation.

Reference success is evidence of OWC application behaviour only. It is not production acceptance of the external evidence repository.
