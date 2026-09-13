# OWC Production Cutover Smoke Checklist

Use this checklist only inside an approved production change after the cutover-readiness evidence has produced a genuine GO. Record the **release SHA**, target environment, tester, time, evidence reference and outcome for every mandatory item. A failed mandatory item triggers the approved stop/rollback decision; it is not waived by a successful reference/sandbox test.

## Platform and public service

- [ ] Confirm deployed release SHA matches the authorized release candidate.
- [ ] Public HTTPS endpoint resolves to the intended production service.
- [ ] TLS certificate and HSTS/security headers are valid from an external check.
- [ ] `/api/health` returns the expected shallow healthy response without sensitive data.
- [ ] Nginx/firewall/routing state matches the approved production configuration.
- [ ] Monitoring, alert routing, process health and disk checks are active.

## Identity and administration

- [ ] Signed-out access to protected administration routes is rejected/redirected correctly.
- [ ] Approved production user can authenticate through the live IdP/OIDC flow.
- [ ] MFA is enforced for the approved administrative test account.
- [ ] RBAC/RLS checks prevent unauthorized content, claims, user and audit actions.
- [ ] Break-glass access remains controlled and is not used as a normal acceptance path.
- [ ] Browser bundles/network traces expose no server credentials or privileged tokens.

## Drupal and public content

- [ ] Production Drupal is reachable through the approved server-side integration path.
- [ ] Final content migration/parity evidence is current.
- [ ] Approved published pages/news/forms/legislation/tenders render correctly.
- [ ] Editorial workflow and authenticated editor access behave as accepted.

## Claims and evidence

- [ ] Lodge a claim using approved production smoke-test data and record the correlation/reference.
- [ ] Track the claim and confirm expected authoritative status mapping.
- [ ] Private evidence upload remains claim-scoped and non-public.
- [ ] Malware scanning follows the approved fail-closed production policy.
- [ ] Evidence metadata/hash/scan state is stored without exposing the file publicly.

## Notifications

- [ ] Approved production email/SMS test message is accepted by the configured gateway.
- [ ] Delivery/outbox status is recorded without leaking message credentials or claimant-sensitive data.
- [ ] Retry/terminal handling follows the accepted operations process.

## CPPS and external integrations

- [ ] Live CPPS status/claim interoperability is verified using approved production smoke methods and test data.
- [ ] CPPS remains authoritative for production claim/payment status.
- [ ] Each required live agency/provider integration in scope is checked against its approved production contract.
- [ ] Any required live integration that cannot be verified remains a blocker; reference/sandbox output does not substitute for it.
- [ ] No external transaction, bank/payment instruction or agency request is blindly retried after an uncertain response.

## Backup, security and reconciliation

- [ ] Current backup references and rollback authority remain valid after the cutover.
- [ ] Security monitoring/logging shows no unexpected authentication, authorization or integration failure.
- [ ] Database/schema, Drupal configuration/content and application release versions match the accepted evidence.
- [ ] OWC claim state is reconciled with CPPS for any smoke-test claim.
- [ ] Any external transaction created during the smoke test has an authoritative outcome recorded.

## Outcome

Overall result: ☐ PASS ☐ FAIL / ROLLBACK DECISION REQUIRED

Tester: ____________________  Time: ____________________

Evidence reference(s): _________________________________________________

Incident/change reference if failed: ____________________________________
