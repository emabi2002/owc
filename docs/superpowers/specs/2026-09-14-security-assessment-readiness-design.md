# OWC Security Assessment Readiness Design

## Purpose

Strengthen repository-side OWC application security controls and prepare a formal evidence package for independent security assessment without claiming that CI, static checks, reference integrations or repository documentation constitute a penetration test, ASVS certification or production security sign-off.

## Standards baseline

The repository security documentation will align its awareness mapping to **OWASP Top 10:2025** and use **OWASP ASVS 5.0.0** as the verification-requirements reference. OWC will not claim blanket ASVS compliance; the external assessor must record which requirements were actually tested and the evidence/results for each applicable control.

## Security boundaries

- No live penetration testing is executed from repository CI.
- No destructive testing is run against production or third-party government systems.
- No secrets, claimant evidence, medical information or banking information are placed in assessment artifacts.
- A passing repository security check means only that the checked source/configuration invariants are present.
- Production acceptance still requires an independent assessment, remediation evidence, retest where required and formal OWC security/business approval.
- CPPS and external-agency authority boundaries are unchanged.

## Repository hardening

### 1. Profile privilege and account-status enforcement

The current database helper functions treat any profile as staff and return its stored role without considering account status. The current self-update policy also allows a user to update their own profile row without a database-level guard against changing privileged fields.

The hardened model will:

- make `public.is_staff()` return true only for an authenticated profile whose status is `active`;
- make `public.current_app_role()` return the stored role only for an active profile, otherwise the least-privileged `viewer` role;
- add a `BEFORE UPDATE` trigger on `public.profiles` that blocks a non-administrator from changing privileged identity/authorization fields on their own row, including `email`, `role`, `status` and `mfa_enabled`;
- allow service-role administration and administrator management of other profiles to continue through the existing authoritative administrative paths;
- preserve self-service updates only for non-privileged profile information;
- provide an explicit idempotent SQL hardening script for already-provisioned environments as well as updating the canonical schema.

### 2. Production Content Security Policy

The production Nginx CSP currently permits `script-src 'unsafe-eval'`. The hardened production baseline will remove `unsafe-eval`. `unsafe-inline` remains only where the current Next.js deployment requires it; migration to nonces/hashes is recorded as a further hardening option rather than falsely claiming nonce-based CSP is already implemented.

### 3. Static repository assurance

A non-destructive repository assurance script will fail when key source/configuration security invariants regress. It will check, at minimum:

- production Nginx CSP does not contain `unsafe-eval`;
- the canonical schema enforces active-status role/staff helpers;
- the profile privileged-field protection trigger/function exists;
- `.env.local` and private-key material are not tracked by Git;
- security documentation references the current OWASP baseline.

The script must not print environment variables or secret values. CI may run this static script because it works only on repository metadata/content and does not contact live services.

## Assessment evidence package

The repository will contain:

- an updated security checklist mapped to OWASP Top 10:2025 with links to OWC controls/evidence;
- an external security-assessment scope defining application, API, authentication/authorization, Drupal, database/RLS, upload/scanning, integrations, infrastructure and recovery boundaries;
- an ASVS 5.0.0-oriented evidence template that allows assessors to record exact requirement identifiers where actually tested;
- a finding register with severity, evidence, owner, remediation, retest and acceptance fields;
- security acceptance gates that separate repository readiness, deployed-environment verification, independent assessment, remediation/retest and final sign-off.

## Findings and remediation governance

Security findings must be classified using the assessor's agreed method and tracked to closure. Repository documentation will not invent risk acceptance, severity downgrades or remediation deadlines. Critical/high-impact findings that affect authentication, authorization, claimant evidence, payment/integration trust, production secrets or data integrity remain go-live blockers until formally resolved or explicitly risk-accepted by the authorized OWC security/business authority.

## CI/TDD approach

A contract test will first require the new database invariants, CSP rule, assurance script and assessment documents. The expected RED run should fail only on the newly required security controls while all existing OWC tests remain green. After implementation, exact-head CI must pass:

- static security assurance;
- deployment/recovery shell syntax validation;
- Bun tests;
- lint/type-check;
- Next.js production build;
- Drupal clean-room reconstruction.

Production SSH deployment must remain skipped because the feature branch is not `main`.

## Production acceptance still external

Repository completion of Task 13 means **security-assessment ready**, not production-security accepted. Remaining production evidence includes:

- approved UAT/staging target and test authorization;
- external HTTPS/TLS/header verification;
- deployed RBAC/RLS/MFA abuse testing;
- evidence upload/scanner testing;
- API/integration authorization and failure-path testing;
- dependency/SCA and infrastructure vulnerability assessment;
- independent web/API penetration testing;
- documented findings/remediation/retest;
- formal security and business-owner sign-off.
