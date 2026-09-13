# OWC End-to-End UAT Readiness Design

## Purpose

Turn the existing OWC reference ecosystem into a repeatable, evidence-producing end-to-end UAT package while preserving a strict distinction between synthetic/reference verification and formal production-like business acceptance.

Task 14 repository completion means the OWC system can execute and document realistic reference UAT without waiting for every live CPPS/agency endpoint. It does **not** mean OWC business users, live agencies or production infrastructure have signed off.

## Governing modes

Every UAT result must identify one of these service modes:

- `REFERENCE/SANDBOX` — synthetic OWC reference CPPS and/or synthetic agency services; suitable for development, demonstration and repository UAT evidence only.
- `LIVE UAT` — an approved non-production authoritative CPPS/agency/service environment with real contract mapping and test authorization.
- `UNAVAILABLE` — the service is not configured/authorized; dependent testing must fail/skip explicitly rather than fabricate success.

The CPPS backend contract remains `live | reference | unavailable`. Silent `mock` success is prohibited.

## Reference UAT suite

Create a dedicated UAT domain under `src/lib/uat/` that composes existing tested services rather than duplicating their business logic.

The suite will execute these minimum scenarios:

1. **REF-UAT-001 — coherent worker claim journey**
   - claim registration;
   - identity verification;
   - employer registration;
   - tax compliance;
   - employment/wage verification;
   - medical verification;
   - insurance verification;
   - bank-account verification;
   - cross-agency reconciliation;
   - claim determination;
   - synthetic payment;
   - claimant notification.

2. **REF-UAT-002 — identity not verified**
   - stops before downstream checks;
   - no payment reference.

3. **REF-UAT-003 — cross-agency record mismatch**
   - individually valid but incoherent records are rejected at reconciliation;
   - no determination/payment proceeds.

4. **REF-UAT-004 — payment idempotency**
   - rerunning the same synthetic payment request reuses the transaction reference;
   - real funds moved remains false.

5. **REF-UAT-005 — reference CPPS lifecycle**
   - register claim;
   - progress only through allowed lifecycle states;
   - assessment uses the clearly labelled reference assumption;
   - approve and schedule payment;
   - record synthetic payment with `realFundsMoved: false`;
   - close the claim.

6. **REF-UAT-006 — invalid CPPS transition rejected**
   - proves the reference CPPS does not allow impossible state jumps.

7. **REF-UAT-007 — backend selection is explicit**
   - configured live backend wins;
   - explicit reference mode is used only when live is absent;
   - otherwise CPPS is unavailable/fail-closed.

## UAT evidence model

Each scenario result must include only safe evidence:

- scenario ID and title;
- suite mode (`REFERENCE/SANDBOX`);
- pass/fail result;
- release Git SHA when available;
- generated timestamp;
- synthetic claim/reference identifiers;
- step names/statuses and correlation IDs where emitted by existing reference services;
- assertion/evidence summaries;
- explicit statement that data is synthetic and production acceptance is not implied.

Evidence must not contain credentials, bearer tokens, private keys, real claimant documents, medical details, bank account numbers or unrestricted upstream payloads.

## Evidence runner

Add a CLI script that executes the reference suite and writes a JSON evidence file to an operator/CI-specified path. It must:

- exit non-zero if any required reference scenario fails;
- include the current release SHA from `GITHUB_SHA` or `git rev-parse HEAD` when available;
- write only reference/synthetic evidence;
- not call live production services;
- not require production credentials.

CI will run this suite on the feature branch after ordinary tests and upload the JSON evidence as a workflow artifact. The artifact is evidence of repository reference UAT only.

## Human/business UAT package

Replace obsolete UAT language that expects silent CPPS mock fallback. Documentation will provide:

- reference-UAT plan and scenario matrix;
- tester/evidence/sign-off template;
- production-like UAT acceptance matrix;
- role coverage for claimant/public user, content/editor/reviewer, claims officer, administrator, infrastructure/operations and security/business owners;
- browser/mobile/accessibility/performance checks;
- evidence upload/scanner, notification, identity/SSO, Drupal and integration acceptance where those services are available;
- explicit defer/blocked status for unavailable live dependencies.

Formal UAT sign-off requires named human testers and an approved environment. Automated reference UAT cannot sign on their behalf.

## Production-like acceptance gates

Formal UAT remains pending until the nominated environment can verify, as applicable:

- approved OWC Supabase/database/private storage;
- deployed Drupal and editorial identity;
- live UAT CPPS contract mapping;
- approved UAT agency endpoints or explicit deferred scope;
- evidence scanner and notifications;
- real RBAC/RLS/MFA behavior;
- HTTPS/security controls;
- accessibility/browser/mobile acceptance;
- agreed performance checks;
- business-owner and security sign-off.

A reference scenario may demonstrate functional behavior for a blocked live dependency, but it must never be used as proof of agency/live interoperability.

## TDD and CI

A RED contract test will first require the suite, evidence runner and updated UAT documentation. Expected RED behavior: all pre-existing tests remain green while only the newly required UAT controls fail.

Final exact-head verification requires:

- repository security assurance;
- shell syntax validation;
- full Bun tests;
- reference UAT runner success;
- generated JSON UAT artifact;
- lint/type-check;
- Next.js production build;
- Drupal clean-room reconstruction;
- production SSH deployment skipped because the branch is not `main`.
