# OWC Security Assessment Readiness — TDD Verification Record

## Scope

This record covers repository-side Task 13 security hardening and independent-assessment readiness. It does not claim a penetration test, ASVS certification, production security acceptance or live-environment verification.

## RED evidence

Feature branch: `feature/security-assessment-readiness`

RED head: `23a206015fdd6e987fa8a8579dbb19a1479064da`

GitHub Actions run: `34778743926`

Observed result:

- deployment/recovery shell validation passed;
- **147 pre-existing tests passed**;
- exactly **6 newly introduced Task 13 security-contract tests failed**;
- lint/build and Drupal clean-room were skipped after the expected test failure;
- production deployment was skipped.

The six expected failures represented:

1. account-status-aware role/staff authorization not yet present;
2. idempotent database hardening SQL not yet present;
3. production CSP still containing the forbidden JavaScript evaluation directive;
4. static repository security-assurance script not yet present;
5. security checklist still using the old OWASP baseline and unsupported retention assumption;
6. independent assessment scope/evidence/finding/acceptance documents not yet present.

No pre-existing OWC test failed in the RED run.

## Implemented controls

### Database authorization

- `current_app_role()` grants the stored role only to an `active` profile and otherwise resolves to `viewer`.
- `is_staff()` requires an active profile.
- `protect_profile_privileged_fields()` prevents a non-administrator from self-changing `email`, `role`, `status` or `mfa_enabled` through the database/API surface.
- the ordinary self-update policy is restricted to active profiles;
- the same controls are supplied in `security-hardening-2026-09-14.sql` for already-provisioned environments.

### Browser/edge security

- production Nginx CSP no longer enables JavaScript evaluation semantics;
- remaining inline-script/style compatibility is explicitly documented for future nonce/hash hardening rather than falsely represented as already solved.

### Static assurance

`scripts/security/repository-assurance.sh` checks repository invariants only. It does not contact live services or dump environment variables. It verifies, among other controls:

- `.env.local` is not tracked;
- no tracked repository file contains a PEM private-key block;
- production CSP does not regress to evaluation semantics;
- database account-status and privileged-field guards remain present;
- the current OWASP/ASVS documentation baseline remains present.

### Independent-assessment package

The repository now contains:

- OWASP Top 10:2025 / ASVS 5.0.0-aware security checklist;
- independent security-assessment scope;
- assessment evidence template;
- finding/remediation/retest register;
- staged security acceptance gates through production cutover.

These artifacts require synthetic/redacted evidence and prohibit secrets, real claimant evidence, medical information and banking information from ordinary assessment records.

## Final verification boundary

The final feature head must pass the repository security assurance, shell syntax validation, full Bun test suite, lint/type-check, Next.js production build and Drupal clean-room reconstruction. Production SSH deployment must remain skipped because the feature branch is not `main`.

The authoritative exact-head result is the GitHub Actions run attached to the final branch head / draft pull request. This record intentionally does not create a post-verification commit merely to copy that run number, because doing so would move the exact head after verification.

## External security acceptance still required

Task 13 repository completion does not complete production security assurance. OWC still requires an approved deployed UAT/staging target, independent web/API and infrastructure/dependency assessment, real role/RLS/MFA tests, scanner/evidence tests, live integration security verification as interfaces become available, remediation/retest of blockers, risk acceptance where authorized, and formal security/business-owner sign-off.
