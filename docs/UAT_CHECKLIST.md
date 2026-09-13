# OWC User Acceptance Testing (UAT) Checklist

Use this checklist for controlled OWC UAT. Record the environment and service mode for every test so reference/synthetic evidence is never mistaken for live interoperability.

**Environment:** ☐ Local ☐ Reference/UAT ☐ Staging ☐ Approved production smoke only  
**Service mode:** ☐ `REFERENCE/SANDBOX` ☐ `LIVE UAT` ☐ `UNAVAILABLE`  
**Tester:** ____________________ **Role:** ____________________ **Date:** __________  
**Release SHA:** ____________________

Allowed result values: **PASS · FAIL · BLOCKED/DEPENDENCY · NOT APPLICABLE**.

## 1. Public site and navigation

- [ ] Header, menus and mobile navigation work and links resolve.
- [ ] Home, About, Claims, Employers, Reports, Publications, Legislation, Tenders, News, FAQs, Contact and Search render correctly.
- [ ] News/article and downloadable-resource routes behave correctly.
- [ ] Footer, PNG/OWC branding and responsive layouts are correct.

## 2. Claimant and claim journey

- [ ] Claim tracking validates the reference and returns the correct backend-labelled status.
- [ ] Unknown claim references return a safe not-found response.
- [ ] Claim lodgement validates required fields, CAPTCHA/declaration where configured, and returns a reference only after accepted processing.
- [ ] Evidence upload uses approved type/size/path controls and a claim-scoped authorization grant.
- [ ] Claim lifecycle/status changes appear consistently to the claimant.
- [ ] Notifications are generated only for supported lifecycle events and contain no medical/banking detail.

## 3. CPPS backend behavior

The approved backend contract is **live / reference / unavailable**; there is no silent fallback that invents success.

- [ ] With an approved CPPS endpoint configured, `LIVE UAT` uses the authoritative UAT contract and evidence identifies that environment.
- [ ] With live CPPS absent and reference CPPS explicitly enabled, the result is labelled `REFERENCE/SANDBOX`.
- [ ] With neither backend authorized, CPPS-dependent operations are `UNAVAILABLE`/fail closed.
- [ ] Reference CPPS assessment is labelled as a reference assumption, not a statutory entitlement rule.
- [ ] Reference/synthetic payment evidence confirms **no real funds moved**.

## 4. Reference end-to-end suite

Automated evidence must show all required scenarios:

- [ ] `REF-UAT-001` coherent 12-step worker compensation journey passes.
- [ ] `REF-UAT-002` unverified identity stops downstream processing and payment.
- [ ] `REF-UAT-003` cross-agency record mismatch stops before determination/payment.
- [ ] `REF-UAT-004` repeated synthetic payment is idempotent.
- [ ] `REF-UAT-005` reference CPPS progresses through allowed lifecycle, assessment, synthetic payment and closure.
- [ ] `REF-UAT-006` invalid CPPS state transition is rejected.
- [ ] `REF-UAT-007` CPPS backend selection proves live/reference/unavailable behavior.

Reference-suite success is repository functional evidence only; it is **not production acceptance**.

## 5. Forms, content and CMS

- [ ] Forms/publications/legislation/tenders/FAQs filters and search work.
- [ ] Tender states display correctly.
- [ ] Drupal published content appears through the Next.js content boundary.
- [ ] Draft/review/publish moderation works for authorized roles.
- [ ] Unauthorized roles cannot bypass editorial workflow or access restricted administration.

## 6. Contact and enquiries

- [ ] Enquiry form validates required fields and abuse controls.
- [ ] Accepted enquiry returns a safe reference.
- [ ] In `LIVE UAT`, the approved OWC database records the enquiry as expected.
- [ ] Failure messages do not expose stack traces, credentials or upstream payloads.

## 7. Authentication, MFA and RBAC

- [ ] Signed-out users cannot access administrator routes.
- [ ] Valid/invalid login flows behave safely and failed authentication is auditable.
- [ ] MFA challenge works for enrolled administrators in the approved environment.
- [ ] Viewer, Claims Officer, Reviewer, Editor and Administrator permissions match the approved role matrix.
- [ ] Suspended/invited accounts do not retain staff privileges.
- [ ] A user cannot self-change privileged profile fields/role through direct APIs.
- [ ] Drupal OIDC/SSO role mapping is verified when the real identity provider is available; otherwise record `BLOCKED/DEPENDENCY`.

## 8. Evidence, malware scanning and storage

- [ ] Approved file types and size limits are enforced.
- [ ] Executable/unsupported evidence is rejected.
- [ ] Malware scanning behaves fail-closed where policy requires it.
- [ ] Private evidence is not publicly addressable.
- [ ] Legal-hold/retention metadata is preserved.
- [ ] Use synthetic claimant documents during testing unless OWC has explicitly authorized another dataset.

## 9. External integrations

For NID/identity, employer registry, tax/employment, medical, insurance, payment/bank and notification services:

- [ ] record service mode (`REFERENCE/SANDBOX`, `LIVE UAT`, `UNAVAILABLE`);
- [ ] verify correlation/evidence identifiers without storing claimant payloads or secrets;
- [ ] confirm timeout/error behavior and no false success;
- [ ] if live UAT endpoint/credentials/contract are unavailable, record `BLOCKED/DEPENDENCY` rather than substituting reference success as agency acceptance.

## 10. Security

- [ ] HTTPS/HSTS/security headers are verified on deployed UAT.
- [ ] Production-style CSP/security configuration is reviewed.
- [ ] Rate limiting/CAPTCHA behavior is exercised safely.
- [ ] No server credential appears in browser bundle/network traces.
- [ ] RLS/direct API role-abuse cases are tested in live UAT.
- [ ] Independent security findings/retests are linked before production sign-off.

## 11. Accessibility, browser and mobile

- [ ] Current Chrome/Edge/Firefox/Safari behavior is accepted as applicable.
- [ ] Keyboard navigation and visible focus work.
- [ ] Skip link, labels, error announcements and heading structure are correct.
- [ ] Colour contrast and responsive/mobile layouts are acceptable.

## 12. Performance and operational readiness

- [ ] Agreed performance checks are executed on the nominated UAT topology; do not reuse local/reference timing as production evidence.
- [ ] Health/monitoring and alert routing are operational in the environment.
- [ ] Backup/recovery readiness and rollback ownership are linked to the tested release.
- [ ] Release SHA, environment and external dependencies are recorded with the UAT evidence.

## Formal UAT result

**Overall:** ☐ PASS ☐ PASS WITH CONDITIONS ☐ FAIL ☐ BLOCKED/DEPENDENCY  
**Open defects/dependencies:** ________________________________________________  
**Business-owner:** ____________________ **Signature/date:** ____________________  
**Security/technical owner:** ____________________ **Signature/date:** ____________________

Automated `REFERENCE/SANDBOX` results cannot populate or replace these human sign-off fields.
