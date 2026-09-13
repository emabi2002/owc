# OWC Production Cutover Evidence Register

This register is the human-controlled evidence index for the final OWC production cutover decision. It records references to approved evidence; it must never contain passwords, API keys, private keys, access tokens, claimant medical records or other secret/sensitive payloads.

## Decision rules

Every required gate must be recorded exactly once. `ACCEPTED` requires an accountable owner and at least one evidence reference. `NOT_APPLICABLE` requires an accountable owner and an authorized scope-decision reference. `NOT_READY` and `BLOCKED` are explicit **NO-GO** states. The `production-authorization` gate additionally requires a distinct production authorization reference from the accountable OWC authority.

The immutable **release SHA** under consideration must match the exact-head build, security, reference-UAT and release evidence. Reference/sandbox evidence may demonstrate functionality, but it does not replace required live CPPS, agency, infrastructure, business or security acceptance.

## Gate register

| Gate | Status | Accountable owner | Evidence reference(s) | Scope decision / blocker | Decision time |
|---|---|---|---|---|---|
| release-candidate | NOT_READY |  |  |  |  |
| production-platform | NOT_READY |  |  |  |  |
| production-data | NOT_READY |  |  |  |  |
| drupal-content | NOT_READY |  |  |  |  |
| identity-access | NOT_READY |  |  |  |  |
| evidence-security | NOT_READY |  |  |  |  |
| notifications | NOT_READY |  |  |  |  |
| cpps | NOT_READY |  |  |  |  |
| external-integrations | NOT_READY |  |  |  |  |
| backup-recovery | NOT_READY |  |  |  |  |
| security-assessment | NOT_READY |  |  |  |  |
| business-uat | NOT_READY |  |  |  |  |
| operations-support | NOT_READY |  |  |  |  |
| cutover-change | NOT_READY |  |  |  |  |
| production-authorization | NOT_READY |  |  |  |  |

## Evidence handling

Evidence references should point to controlled records such as approved change requests, exact-head CI runs, UAT reports, security assessment and retest reports, backup/restore rehearsal evidence, Drupal parity reports, configuration acceptance records, CPPS interoperability evidence, agency acceptance, monitoring readiness, operations approvals and signed business decisions. Record the reference and owner rather than copying confidential content into this file.

Before a GO/NO-GO meeting, reconcile this register with `docs/cutover/cutover-readiness-template.json`. Any discrepancy, missing gate, duplicate decision, unresolved blocker or unevidenced acceptance remains a **NO-GO** until corrected and re-approved.
