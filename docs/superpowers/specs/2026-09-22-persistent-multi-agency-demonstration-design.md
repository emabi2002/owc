# Persistent Multi-Agency Demonstration Design

**Date:** 22 September 2026  
**System:** Office of Workers Compensation digital platform  
**Supabase project:** `qzmwluwzgrqvcrscoomp`  
**Status:** Approved design baseline

## 1. Purpose

Replace the OWC application's process-local demonstration state with durable PostgreSQL records in the supplied Supabase project. The demonstration must show OWC exchanging verification requests with NID, IPA, IRC, health providers, insurers, employers and banks while stating truthfully that every external record is synthetic and every payment is simulated.

This change is backend-only. Existing public, administration and management pages, routes, forms, labels, dashboards and workflows remain visually unchanged.

## 2. Non-negotiable constraints

- Do not redesign or restructure the user experience.
- Preserve current page routes and API response contracts.
- Store demonstration records persistently in Supabase rather than process memory.
- Use synthetic identities, medical records, employment data and banking data only.
- Never connect the demonstration payment flow to a bank or move real money.
- Keep the Supabase secret key server-only and outside source control.
- Keep Drupal Cloud authoritative for editorial/public content.
- Keep claims, evidence, workflow, agency verification, audit and reporting data in Supabase.
- Preserve the existing fail-closed production connector boundary.
- Do not represent any reference agency as a live production connection.

## 3. Selected architecture

The system uses one Supabase PostgreSQL database with logically isolated schemas. Each agency schema represents an independently governed source system. OWC accesses agency data only through server-side repository adapters that reproduce the existing integration contracts.

This is more faithful than placing every record in `public`, but materially simpler than operating separate Supabase projects for a bidding demonstration. A future live connector can replace an agency repository without changing the OWC workflow or UX.

```text
Existing OWC screen
  -> existing Next.js API route
    -> institutional repository contract
      -> Supabase agency schema
        -> integration_hub request/event record
          -> existing response shape returned to the screen
```

## 4. Database boundaries

### 4.1 Existing public application schema

Existing `public` tables and Supabase Auth integration remain intact. `public.profiles` continues to represent staff authorization, and current content/claim tables remain compatible while the new durable repositories are introduced.

### 4.2 `owc_core`

OWC-owned operational records:

- `scenarios`: dataset identity, version, lifecycle and reset metadata.
- `claimants`: synthetic claimant demographic and contact data.
- `employers`: OWC's employer reference and contact data.
- `claims`: claim reference, claimant, employer, incident, status and assignment.
- `claim_status_history`: append-only workflow transitions.
- `assessments`: eligibility, causation and compensation assessment.
- `decisions`: approved or declined determinations and reasons.
- `communications`: claimant lifecycle communications and delivery outcome.
- `compensation_records`: approved amount and finance processing state.

### 4.3 `nid_registry`

- `persons`: synthetic NID holder details.
- `identity_documents`: synthetic document references and status.
- `verification_history`: immutable lookup outcomes.

### 4.4 `ipa_registry`

- `companies`: company number, legal name, status and registration dates.
- `directors`: synthetic director associations.
- `verification_history`: company lookup outcomes.

### 4.5 `irc_registry`

- `taxpayers`: synthetic TIN and taxpayer identity.
- `compliance_status`: effective-dated compliance records.
- `verification_history`: compliance lookup outcomes.

### 4.6 `health_registry`

- `facilities`: hospitals, clinics and provinces.
- `practitioners`: synthetic practitioner registration records.
- `medical_certificates`: claim-linked synthetic medical evidence.
- `verification_history`: certificate verification outcomes.

### 4.7 `insurance_registry`

- `insurers`: synthetic insurer directory.
- `policies`: employer policy and coverage period.
- `coverage_history`: effective-dated policy status.
- `verification_history`: coverage lookup outcomes.

### 4.8 `employment_registry`

- `employers`: external HR source representation.
- `employees`: synthetic employee and occupation records.
- `wage_snapshots`: effective-dated wage evidence.
- `verification_history`: employment lookup outcomes.

### 4.9 `banking_registry`

- `banks`: demonstration financial institutions.
- `accounts`: synthetic, masked account records only.
- `account_verification_history`: account-holder verification outcomes.
- `simulated_transactions`: idempotent transaction and receipt references with `simulation = true` and `money_movement = false` enforced by database constraints.

### 4.10 `integration_hub`

- `service_state`: online, degraded or offline demonstration condition per service.
- `requests`: correlation ID, agency, operation, request time and safe request identifiers.
- `events`: safe telemetry containing status, latency, correlation ID and source only.
- `verification_results`: normalized outcome linked to a claim and source agency.

Sensitive identity, medical and banking payloads must not be copied into telemetry.

### 4.11 `audit`

- `events`: append-only actor, action, entity, timestamp and safe metadata.
- Direct update and delete privileges are revoked from application roles.

### 4.12 `reporting`

Security-invoker views and read-only functions expose management metrics without granting direct agency-schema access. Reporting includes claims summary, province, employer, aging, injury category, turnaround, compensation and simulated payment status.

The Management AI Analyst may consume only these approved reporting interfaces. It cannot execute arbitrary SQL or operational writes.

## 5. Storage design

Structured records remain in PostgreSQL. Supabase Storage contains synthetic files only.

Private buckets:

- `owc-claim-evidence`
- `owc-identity-documents`
- `owc-medical-certificates`
- `owc-employment-documents`
- `owc-insurance-documents`
- `owc-simulated-receipts`

Every object is associated with database metadata containing scenario ID, claim reference, category, uploader, integrity hash, media type and retention state. Access uses signed URLs and role-aware server routes. No bucket is public.

## 6. Demonstration scenarios

The seed is deterministic and idempotent. Re-running it produces the same natural keys and does not duplicate records.

1. **Complete approved claim:** coherent identity, registered employer, compliant taxpayer, confirmed employment, valid medical certificate, active insurance and verified masked bank account; progresses to a simulated paid outcome.
2. **Missing medical evidence:** lodges successfully, moves to Awaiting Documents, records a communication, receives a later certificate and returns to assessment before approval.
3. **Declined claim:** records an identity/employment or causation inconsistency, retains the failed verification trail and ends with a reasoned decline.
4. **Fatal workplace accident:** includes dependant records, employer incident evidence and a dependant decision path without exposing real people.
5. **Occupational illness:** includes historical employment and medical evidence, an aging assessment and management reporting impact.

The scenarios cover several PNG provinces, employers, injury categories, statuses and aging bands so management reports are meaningful.

## 7. Compatibility strategy

Existing components and API routes remain the UX contract. Database repositories are introduced behind the current service functions.

- Current integration routes keep their paths and response envelopes.
- Current claim screens keep their data shapes.
- Existing safe terminology remains visible.
- Existing deterministic in-memory implementations remain available only as test fixtures during migration, not as deployed persistence.
- The application fails closed when the database is configured but unavailable; it must not silently substitute static records in the persistent demonstration environment.

## 8. Configuration

New key names follow current Supabase guidance:

- `NEXT_PUBLIC_SUPABASE_URL`: public project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: browser-safe publishable key.
- `SUPABASE_SECRET_KEY`: server-only secret key that bypasses RLS.
- `OWC_DATA_ENVIRONMENT=demonstration`: explicit dataset classification.
- `OWC_PERSISTENT_DEMONSTRATION=true`: enables database-backed reference connectors.

Legacy variable names may be accepted temporarily for compatibility, but documentation and deployment templates use the new names. Secret values are never committed or printed.

## 9. Security model

- All exposed tables have RLS enabled.
- Agency schemas grant no access to `anon` or ordinary `authenticated` users.
- Server-side repositories use the secret key and return bounded response DTOs.
- Staff authorization continues to depend on active `public.profiles` records, not user-editable metadata.
- Public claim tracking exposes only the approved status projection.
- Reporting views use `security_invoker = true` or remain in an unexposed schema.
- Any privileged function is placed in an unexposed schema, has a fixed `search_path`, verifies the caller and has default `PUBLIC` execution revoked.
- Simulated transaction constraints make real-money claims structurally invalid.
- Storage policies authorize access by role, claim relationship and bucket purpose.

## 10. Error handling and observability

- Each connector creates a correlation ID before performing a lookup.
- Successful, not-found, invalid, unavailable and error outcomes are recorded consistently.
- Upstream or database errors return bounded messages and never echo credentials or sensitive payloads.
- Service-state controls can demonstrate a single-agency outage without corrupting source data.
- Idempotency keys prevent duplicate simulated payments.
- Failed writes are transactional: the OWC outcome and integration event either commit together or the operation reports failure.

## 11. Drupal Cloud boundary

Drupal Cloud owns pages, news, publications, legislation, forms, FAQs and editorial workflow. The existing Drupal JSON:API adapter remains the public-content boundary.

Supabase does not reproduce Drupal's internal editorial tables. OWC claims, evidence, institutional verification, audit and management reporting remain outside Drupal.

## 12. Migration and rollout

1. Capture the current test/build baseline.
2. Add versioned, idempotent SQL migrations without secrets.
3. Validate migrations against an isolated PostgreSQL/Supabase-compatible environment.
4. Add repository contracts and tests before production implementation.
5. Implement Supabase repositories behind existing service interfaces.
6. Add deterministic seed and verification scripts.
7. Add Storage bucket policy migration.
8. Run unit, contract, type, build and security checks.
9. Apply the migration manually through an authorized Supabase SQL channel.
10. Seed and verify the supplied demonstration project.
11. Configure Netlify environment variables and redeploy.
12. Run the end-to-end training/UAT guide against the deployed environment.

The database migration is additive. Rollback disables persistent demonstration mode and reverts the application deployment; destructive schema removal is a separately authorized operation and is not part of automated rollback.

## 13. Test strategy

- SQL contract tests assert schemas, constraints, indexes, RLS and grants.
- Repository behavior tests cover found, not-found, outage, malformed and database-error outcomes.
- Cross-agency coherence tests prevent records from different people or employers being accepted together.
- Payment tests prove idempotency and `money_movement = false`.
- API contract tests prove existing paths and response shapes remain unchanged.
- Reporting tests reconcile totals to source records.
- Security tests prove browser credentials cannot access agency schemas and the secret never enters client bundles.
- Full existing tests, TypeScript checks and the Next.js production build must pass.

## 14. Acceptance criteria

- Existing UX and routes are unchanged.
- Refreshing, restarting or redeploying Netlify does not erase demonstration history.
- Each agency lookup reads the correct institutional schema.
- Integration Control Centre events persist and retain correlation IDs.
- All five scenarios can be demonstrated end to end.
- Management reports reconcile with persisted claims.
- The AI Analyst remains read-only.
- No real payment connector exists.
- No credentials are committed.
- The Supabase project passes applicable database security and performance advisor checks after deployment.
