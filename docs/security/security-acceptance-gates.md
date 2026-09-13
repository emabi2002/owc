# OWC Security Acceptance Gates

These gates separate repository engineering readiness from independent security assurance and final production authorization. A passing CI run is necessary engineering evidence, but it is not a penetration test or production security sign-off.

## Gate 1 — Repository security readiness

Required before promoting the release candidate to formal UAT/security assessment:

- [ ] security contract tests pass;
- [ ] repository static security assurance passes;
- [ ] profile privilege/account-status hardening is present in the canonical schema and approved hardening SQL;
- [ ] production CSP excludes `unsafe-eval`;
- [ ] application tests, lint/type-check and build pass;
- [ ] Drupal clean-room reconstruction passes;
- [ ] no production deployment is triggered from the feature branch.

**Acceptance authority:** engineering/reviewer. This gate does not authorize production.

## Gate 2 — Deployed UAT environment verification

- [ ] approved release SHA is deployed to the nominated UAT/staging environment;
- [ ] HTTPS/TLS/security headers are verified externally;
- [ ] real UAT role accounts and MFA/SSO configuration are available;
- [ ] RLS/database hardening SQL is verified on the deployed database;
- [ ] private evidence storage/scanner and notification services are configured as applicable;
- [ ] CPPS/agency connectors are clearly identified as real UAT, reference/sandbox or unavailable;
- [ ] logs/alerts and backup/recovery controls are available for testing.

**Acceptance authority:** OWC technical/infrastructure owners.

## Gate 3 — Independent security assessment

The independent assessor executes the approved scope using **OWASP Top 10:2025** and applicable **ASVS 5.0.0** requirements as references.

- [ ] authorization to test is recorded;
- [ ] web/API/authentication/authorization/RLS/CMS/upload/integration/infrastructure scope is executed;
- [ ] dependency/software-supply-chain assessment is completed;
- [ ] findings are validated and recorded without secrets or real claimant evidence;
- [ ] exact tested ASVS versioned identifiers are recorded where used;
- [ ] assessor report and recommendation are delivered.

**Acceptance authority:** independent assessor produces findings; OWC security owner receives them.

## Gate 4 — Remediation and retest

- [ ] all go-live-blocking findings have remediation owners;
- [ ] code/config remediation references are recorded;
- [ ] engineering regression tests pass;
- [ ] independent retest is performed for remediated blocker findings;
- [ ] retest evidence/result is recorded;
- [ ] remaining residual risks are documented.

A developer or CI job cannot self-certify an independent retest.

## Gate 5 — Risk acceptance and security sign-off

Any unresolved finding requiring **risk acceptance** must have:

- finding/risk reference;
- business and technical impact;
- compensating controls;
- expiry/review condition where applicable;
- named authorized OWC security/business authority approval.

No risk is considered accepted merely because it is known, deferred or difficult to remediate.

Required final security decisions:

- [ ] independent assessor recommendation received;
- [ ] OWC security owner sign-off recorded;
- [ ] OWC business-owner sign-off recorded;
- [ ] unresolved risk acceptance is explicitly authorized;
- [ ] cutover issue/checklist links to the accepted assessment release SHA.

## Gate 6 — Production cutover security checks

Immediately before/after cutover:

- [ ] production release SHA matches the approved assessed release or approved delta review;
- [ ] production reference/sandbox modes are disabled or intentionally isolated;
- [ ] production secrets/credentials are rotated/loaded through approved mechanisms;
- [ ] TLS/headers/CSP smoke checks pass;
- [ ] admin MFA and role access smoke tests pass;
- [ ] evidence upload/scanner fail-closed behavior is verified safely;
- [ ] security logging/alert routing is operational;
- [ ] rollback and incident contacts are available.

Production security acceptance is complete only when the applicable gates above have recorded evidence and authorized sign-off.
