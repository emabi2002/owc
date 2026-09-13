# OWC End-to-End UAT Readiness — TDD Verification Record

## Scope

This record covers repository/reference Task 14 UAT readiness. It proves repeatable `REFERENCE/SANDBOX` end-to-end behavior and safe evidence generation. It does not claim formal `LIVE UAT`, production acceptance, live CPPS/agency interoperability or human business/security sign-off.

## RED evidence

Feature branch: `feature/end-to-end-uat-readiness`

RED head: `06df6c5d71df79a0befac9997460cb284c5a0ad5`

GitHub Actions run: `34779336755`

Observed result:

- shell validation passed;
- repository security assurance passed;
- **153 pre-existing tests passed**;
- exactly **6 new UAT contract tests failed** because the required UAT suite/runner/documents were intentionally absent;
- lint/build and Drupal clean-room were skipped after the expected test failure;
- production deployment was skipped.

The expected failures represented:

1. seven-scenario reference suite and explicit synthetic mode absent;
2. formal composition of the existing 12-step worker claim journey absent;
3. negative/coherence/idempotency/reference-CPPS/backend-selection UAT layer absent;
4. JSON evidence CLI absent;
5. updated reference/live UAT documentation absent;
6. sensitive-data/production-acceptance evidence rules absent.

No pre-existing OWC test failed in the RED run.

## Implemented reference UAT controls

### Automated suite

The UAT domain executes:

- `REF-UAT-001` — coherent 12-step worker compensation claim journey;
- `REF-UAT-002` — identity failure stops downstream processing;
- `REF-UAT-003` — incoherent cross-agency records are stopped at reconciliation;
- `REF-UAT-004` — synthetic payment idempotency;
- `REF-UAT-005` — complete reference CPPS lifecycle through assessment, synthetic payment and closure;
- `REF-UAT-006` — invalid CPPS transition rejection;
- `REF-UAT-007` — explicit live/reference/unavailable backend selection.

All automated scenario results are labelled `REFERENCE/SANDBOX`, `syntheticData=true` and `productionAcceptance=false`. Reference CPPS/payment evidence confirms no real funds moved.

### Runtime behavior tests

Additional behavior tests exercise the actual suite result, scenario ordering, the 12 integration steps/correlation evidence, synthetic payment flag and backend-selection evidence rather than relying only on source-contract assertions.

### Evidence runner

`bun run uat:reference` executes the suite, links evidence to `GITHUB_SHA` or the local Git SHA, writes JSON to `OWC_UAT_EVIDENCE_PATH` (or the default artifacts path), and exits non-zero if a required scenario fails.

CI uploads the generated JSON evidence as `reference-uat-evidence` for the run. The artifact contains safe synthetic evidence only.

### Human/live UAT package

The repository UAT documentation now:

- removes obsolete silent mock-fallback expectations;
- uses `REFERENCE/SANDBOX`, `LIVE UAT` and `UNAVAILABLE` modes;
- supports `BLOCKED/DEPENDENCY` for missing authoritative services;
- requires named human business/security/technical sign-off for formal UAT;
- covers public/claimant journeys, claims processing, Drupal/content, MFA/RBAC/RLS, evidence/scanner, notifications, integrations, security, browser/mobile/accessibility, performance and operations;
- prohibits secrets, real claimant evidence, medical detail and unrestricted banking information from ordinary UAT evidence.

## Final verification boundary

The final branch head must pass:

- repository security assurance;
- deployment/recovery/security shell validation;
- all Bun tests including UAT contract and behavior tests;
- `bun run uat:reference` with all seven required scenarios passing;
- generated JSON UAT workflow artifact;
- lint/type-check;
- Next.js production build;
- Drupal clean-room reconstruction;
- production SSH deployment skipped because the branch is not `main`.

The authoritative final exact-head GitHub Actions run and artifact are attached to the final branch head / draft pull request. This file intentionally does not create a post-verification commit merely to copy that final run number.

## External acceptance still required

Formal production-like UAT remains external until OWC has an approved deployed environment and the required authoritative services. Live acceptance requires, as applicable, approved OWC database/private storage, Drupal/identity, CPPS and agency UAT contracts/endpoints, malware scanner, notifications, RBAC/RLS/MFA, deployed security checks, accessibility/browser/mobile/performance evidence, defect/retest closure and named business-owner/security/technical sign-off.

Reference UAT evidence can demonstrate intended behavior for a blocked dependency, but it cannot be used as proof of live agency or CPPS acceptance.
