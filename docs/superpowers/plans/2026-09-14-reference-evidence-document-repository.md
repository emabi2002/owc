# Task 2 — Reference Evidence & Document Repository Implementation Plan

**Base:** verified `main` SHA `e7cec5d6fd4f9d360bfa707ef891029fa8fafc35`
**Branch:** `feature/reference-evidence-document-repository`

## Goal

Deliver a working, explicitly synthetic OWC evidence/document repository for demonstrations while leaving the live Supabase Storage route fail-closed and unchanged in authority.

## Implementation sequence

1. **Contract RED**
   - Add contract tests requiring an explicit `OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY` flag defaulting off.
   - Require reference health metadata to identify `source: reference`, `productionConnected: false`, `durable: false`.
   - Require claim isolation, immutable SHA-256 metadata, safe file validation, scan enforcement, review workflow reuse and non-disclosing disabled HTTP behaviour.
   - Require staff RBAC additions `evidence.view` and `evidence.manage` with Assessment read-only and no Finance/Editor blanket evidence access.
   - Require operational documentation separating reference from production storage.
   - Run CI and verify only new Task 2 expectations fail.

2. **Reference repository core**
   - Add `src/lib/claims/reference-evidence-repository.ts` with process-local synthetic object store.
   - Reuse `validateEvidenceFile`, `buildEvidenceStoragePath`, `sha256Hex`, `shouldBlockEvidenceUpload`, and `buildEvidenceReviewUpdate`.
   - Seed only deterministic synthetic demonstration documents containing no real PII/medical/banking content.
   - Implement list/get/store/review/reset operations with exact claim/object matching.
   - Block infected evidence from retrieval; honour mandatory-scanner policy for unavailable/not-configured scan states.
   - Never implement automatic retention deletion.

3. **Selection/configuration boundary**
   - Add `OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY=false` to `.env.example` and server env.
   - Reference adapter is enabled only by explicit true value.
   - Do not change live Supabase Storage precedence or convert live failures into synthetic successes.

4. **RBAC**
   - Add `evidence.view` for Administrator, Claims Officer and Assessment Officer.
   - Add `evidence.manage` only for Administrator and Claims Officer.
   - Do not grant evidence permissions to Finance/Payment Officer, Content Editor, Reviewer or Viewer unless later explicitly approved.

5. **Reference HTTP facade**
   - Add disabled-by-default reference endpoints for health, claim-scoped listing/upload and exact claim/object retrieval.
   - Return non-disclosing 404 while disabled.
   - Return explicit reference/non-durable labels when enabled.
   - Validate request bodies/files; never accept arbitrary paths.

6. **Behaviour tests**
   - Prove deterministic seed listing.
   - Prove cross-claim object retrieval fails.
   - Prove uploaded bytes hash to stored SHA-256 and safe path.
   - Prove invalid/oversize types are rejected.
   - Prove infected evidence cannot be downloaded.
   - Prove review may transition only from Pending Review.
   - Prove legal-hold metadata survives review/storage operations.
   - Prove reference reset restores deterministic fixture state.

7. **Documentation/status**
   - Add `docs/operations/reference-evidence-repository.md` with demo enablement, limitations, role model, reset and post-award migration boundary.
   - Update task/status documentation if the programme status file has an appropriate Task 2 section.

8. **GREEN verification**
   - Run full PR CI: security assurance, all Bun tests, reference E2E UAT, lint/type-check, build and Drupal clean-room.
   - Confirm feature-branch SSH deployment does not occur.
   - Freeze exact green head, promote PR, merge under existing uninterrupted approval, then verify the merged `main` SHA before Task 3.

## External/post-award gates

Task 2 does not configure a production object-store provider, approve a statutory retention period, certify a production malware-scanning service, or migrate real claimant documents. Those remain external/live acceptance items.
