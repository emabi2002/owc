# OWC Production-like UAT Acceptance Matrix

## Purpose

Define the evidence required before OWC can call formal UAT complete. Automated `REFERENCE/SANDBOX` results are useful functional evidence but are not production acceptance and do not prove live CPPS/agency interoperability.

Allowed service modes are `REFERENCE/SANDBOX`, `LIVE UAT` and `UNAVAILABLE`. Use `BLOCKED/DEPENDENCY` when an authoritative live-UAT dependency is not available.

## Acceptance matrix

| Area | Minimum production-like evidence | Owner/sign-off | Reference evidence acceptable? |
| --- | --- | --- | --- |
| Public portal/content | Approved deployed release, navigation/content/forms/search on target browsers/mobile | Business-owner/content owner | Yes for functional preview; deployed acceptance still required |
| Drupal CMS/editorial workflow | Deployed Drupal, content parity, moderation workflow, authorized editor roles | Content/CMS owner | Reference/CI reconstruction supports but does not replace deployed acceptance |
| Authentication/MFA/RBAC/RLS | Real UAT users/roles, MFA, suspension, direct-API/RLS abuse tests | Technical + security owner | No for final identity/security acceptance |
| Claim lodgement/tracking | Approved UAT database/storage and correct claim lifecycle behavior | Claims/business process owner | Yes for process demonstration only |
| Claim evidence | Private storage, signed access, type/size controls, retention/legal hold and approved scanner behavior | Claims + security/storage owner | Partial; live storage/scanner acceptance required |
| CPPS | Authoritative contract mapping, `LIVE UAT` endpoint/auth, lifecycle/status/payment interoperability | CPPS/OWC claims owner | No; reference CPPS cannot prove live CPPS acceptance |
| NID/employer/tax/employment | Approved live-UAT interface or explicitly deferred scope | Agency/integration owner | Reference may demonstrate expected flow only |
| Medical/insurance | Approved live-UAT interface or explicitly deferred scope | Agency/integration owner | Reference may demonstrate expected flow only |
| Bank/payment | Approved UAT payment interface with non-production test instructions | Payment/integration owner | Synthetic evidence must state **no real funds moved**; cannot prove bank acceptance |
| Notifications | Approved email/SMS gateway and template/delivery evidence | Operations/business owner | Reference notification is functional evidence only |
| Security | Exact assessed release, independent assessment, blocker remediation/retest | Security + business-owner | No |
| Operations/monitoring | Health/alerts/service ownership/incident routing demonstrated | Operations owner | CI/monitor scripts support but do not replace environment drill |
| Backup/recovery | Approved backup policy and isolated restore rehearsal linked to release | Infrastructure/data owner | Repository scripts alone are insufficient |
| Accessibility/browser/mobile | Named testers and target browser/device evidence | Business-owner/accessibility reviewer | Automated/reference evidence may supplement |
| Performance | Agreed target/topology and measured results | Technical/business owner | Local/reference timings are not production evidence |

## Formal scenario groups

### A. Claimant/public journey

- lodge a valid claim;
- reject/validate incomplete or malformed input;
- upload approved synthetic evidence;
- track claim progress;
- receive safe status notifications;
- verify no secret, medical or bank detail leaks through messages/errors.

### B. Claims processing

- claims officer accesses only authorized workload;
- evidence review/verification/rejection works;
- status transitions follow approved workflow;
- CPPS state mapping is correct in `LIVE UAT`;
- payment state is not marked complete without authoritative evidence;
- duplicate/retry behavior does not create duplicate payment instructions.

### C. Content and administration

- editor/reviewer/admin workflow is enforced;
- unauthorized roles are denied;
- suspended/invited accounts lose staff privilege;
- administrative role changes are auditable;
- Drupal SSO/group mapping works in the approved identity environment.

### D. Failure and dependency behavior

- unavailable CPPS/agency services fail/stop clearly rather than fabricate success;
- scanner outage follows fail-closed policy where required;
- notification failure/retry is visible and auditable;
- integration timeouts/errors do not expose upstream payloads;
- rollback/incident escalation ownership is known.

## Defects and dependencies

Formal UAT cannot be called PASS while an acceptance-critical test is `BLOCKED/DEPENDENCY` unless the authorized business/security acceptance authority explicitly removes that item from go-live scope and records the decision. Reference success is not a valid substitute for a blocked authoritative service.

## Security and privacy evidence

UAT records must not contain production secrets, private keys, complete authentication tokens, real claimant evidence, medical detail or unrestricted bank data. Use synthetic/approved UAT identifiers and correlation IDs.

The independent security assessment and remediation/retest status must be linked to the same release SHA or an approved delta review before production sign-off.

## Final decision

Production-like UAT is complete only when:

- all in-scope critical business scenarios have PASS evidence;
- live-UAT dependencies required for go-live are accepted;
- remaining `BLOCKED/DEPENDENCY` items are formally resolved or removed from scope by authorized decision;
- defects are resolved/retested or explicitly accepted under approved governance;
- security acceptance is recorded;
- business-owner, technical/operations and security sign-offs are recorded;
- the accepted release SHA is identified for cutover.

Automated `REFERENCE/SANDBOX` UAT can never sign these approvals on behalf of OWC personnel.
