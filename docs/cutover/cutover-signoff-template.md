# OWC Production Cutover Sign-off Record

This template records a human production decision after the technical evidence has been evaluated. A blank field, unsigned section or unchecked item is **not** approval. Repository CI, reference UAT or a `GO` calculation cannot replace the explicit production authorization recorded here.

## Change identification

- Release SHA: __________________________________________
- Target production environment: _________________________
- Change / CAB reference: ________________________________
- Approved change window: ________________________________
- Cutover lead: __________________________________________
- Rollback authority: ____________________________________
- Cutover readiness evidence file/reference: ______________
- Evaluator result: ☐ GO ☐ NO-GO

If the evaluator result is `NO-GO`, production cutover is not authorized and this record must not be used to override the blockers.

## Evidence confirmation

- [ ] Exact-head build/test/security evidence matches the release SHA.
- [ ] Production platform, DNS/TLS, monitoring and access ownership are accepted.
- [ ] Production database/private storage and Drupal migration/parity are accepted.
- [ ] Identity/OIDC/MFA and RBAC/RLS acceptance is complete.
- [ ] Evidence storage, malware scanning, retention/legal-hold controls are accepted.
- [ ] Notification service and delivery UAT are accepted.
- [ ] Live CPPS contract/interoperability and reconciliation ownership are accepted.
- [ ] Required live agency/provider integrations are accepted or have authorized scope decisions.
- [ ] Backup, recovery, RPO/RTO and restore-rehearsal evidence are accepted.
- [ ] Independent security findings/retests and security sign-off are complete.
- [ ] Production-like business UAT and defect/dependency disposition are complete.
- [ ] Operations/support, monitoring alerts and incident/escalation arrangements are accepted.
- [ ] Cutover smoke checklist and rollback/reconciliation authorities are ready.

Reference/sandbox results may support technical evidence but do not satisfy a mandatory live acceptance item.

## Production authorization

Production authorization reference: ____________________________________

Accountable OWC authority: _____________________________________________

Decision: ☐ AUTHORIZE GO-LIVE ☐ DO NOT AUTHORIZE

Signature / approved record reference: _________________________________

Date/time: _____________________________________________________________

## Cutover outcome

- Smoke checklist result: ☐ PASS ☐ FAIL
- Rollback invoked: ☐ NO ☐ YES
- If rollback/recovery occurred, incident/change reference: ______________
- CPPS reconciliation evidence: ________________________________________
- External transaction reconciliation evidence: ________________________
- Residual defects/risks and accepted owner: ____________________________

## Final acceptance

Business owner: __________________  Decision/reference: _________________

Security authority: ______________  Decision/reference: _________________

Technical authority: _____________  Decision/reference: _________________

Operations owner: ________________  Decision/reference: _________________

Cutover lead: ____________________  Closure/reference: ___________________

The change may be closed only when smoke evidence, business/security/technical acceptance and authoritative-state reconciliation are complete. This document does not itself execute deployment, rollback, CPPS action or any external transaction.
