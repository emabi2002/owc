# OWC Production Integration Hub Verification Evidence — 13 September 2026

## Scope

This evidence records repository-level verification for the production Integration Hub foundation layered on `feature/claims-evidence-production-readiness`.

The work provides a server-only connector registry and safe generic transport for five external service classes: NID/identity, employer registry, insurance, payments and medical-provider integration. It does not fabricate agency schemas or claim live external connectivity.

## TDD evidence

- Initial registry/configuration work intentionally entered RED at GitHub Actions run `34755151684` because the registry implementation did not yet exist.
- Safe HTTP transport contract intentionally entered RED at run `34756128967` before `http.ts` was implemented.
- Focused registry, transport, telemetry and operational-readiness tests are included in the normal Bun test suite.

## Green verification

Exact pre-evidence implementation head: `5603347854654aa94fba528ce0d34f3aba3b2d76`.

GitHub Actions run `34756370880` completed successfully on that head:

- Test · Lint · Type-check · Build: **success**
- Drupal clean-room reconstruction: **success**
- Ubuntu production deployment: **skipped** as required for a feature branch

The Drupal job independently rebuilt the isolated stack, reconstructed CMS configuration, imported canonical OWC content, verified migration idempotency and source parity, configured CI OIDC identity, verified editor identity readiness, verified the reconstructed CMS and re-verified bootstrap idempotency.

## Security/governance checks

- External service credentials are server-only environment variables; no `NEXT_PUBLIC_*` agency credential is introduced.
- Missing base URL returns `configuration-required` and prevents outbound network calls.
- Non-local production transport requires HTTPS.
- Bearer credentials remain in request headers and are never returned in result envelopes.
- Upstream/network failures are normalized without echoing upstream payloads.
- Telemetry contains only service, operation, correlation ID, outcome, HTTP status, duration and timestamp; claimant identity, medical, banking and credential payloads are excluded.
- CPPS authority is unchanged.
- Operational readiness distinguishes configured endpoints from verified live connectivity.

## External acceptance dependencies

The following remain external and are deliberately not represented as live: OWC production Supabase/storage, NID/identity endpoint and approved schema, employer/business registry endpoint and schema, insurer endpoint and schema, finance/payment gateway and schema, medical-provider interface and schema, credentials, private network connectivity where required, production DNS/TLS, formal agency UAT/security approval and production cutover acceptance.
