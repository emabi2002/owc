# OWC Reference End-to-End UAT Plan

## Purpose

This plan defines repeatable end-to-end UAT against the OWC synthetic/reference ecosystem. All automated results from this plan are labelled **`REFERENCE/SANDBOX`**, use synthetic data and do **not** constitute production acceptance, live CPPS acceptance or agency interoperability acceptance.

Service modes used by OWC UAT are:

- **`REFERENCE/SANDBOX`** — synthetic/reference services for safe functional testing;
- **`LIVE UAT`** — approved authoritative non-production services with real interface contracts;
- **`UNAVAILABLE`** — not configured or not authorized; dependent tests are recorded `BLOCKED/DEPENDENCY` rather than fabricated as successful.

## Preconditions

- repository release SHA recorded;
- repository security assurance and unit tests pass;
- reference CPPS and integration sandbox are explicitly enabled only in the intended non-production context;
- synthetic identifiers/documents are used;
- no production credentials, real claimant evidence, medical records, bank details or real funds are used.

## Automated reference scenario matrix

| ID | Scenario | Expected result | Key evidence |
| --- | --- | --- | --- |
| `REF-UAT-001` | Coherent worker compensation journey | PASS | All 12 ordered steps pass with correlation IDs; synthetic payment/notification complete. |
| `REF-UAT-002` | Identity not verified | PASS when control works | Processing stops at identity; no downstream payment reference. |
| `REF-UAT-003` | Cross-agency record mismatch | PASS when control works | Reconciliation rejects incoherent records; no determination/payment. |
| `REF-UAT-004` | Synthetic payment idempotency | PASS | Repeated workflow reuses the same transaction reference; **no real funds moved**. |
| `REF-UAT-005` | Reference CPPS lifecycle | PASS | Allowed lifecycle → reference assessment → approved → payment scheduled → synthetic paid → closed; `realFundsMoved=false`. |
| `REF-UAT-006` | Invalid CPPS transition | PASS when control works | Impossible state jump is rejected. |
| `REF-UAT-007` | CPPS backend selection | PASS | Live wins when configured; reference requires explicit enablement; otherwise `UNAVAILABLE`. |

## REF-UAT-001 expected integration sequence

1. claim registration;
2. identity verification;
3. employer registry verification;
4. tax compliance;
5. employment/wage verification;
6. medical verification;
7. insurance verification;
8. bank account verification;
9. cross-agency record reconciliation;
10. determination;
11. synthetic payment;
12. claimant notification.

Each existing integration step emits safe correlation metadata. Evidence must use those IDs/summary values rather than unrestricted claimant or upstream payloads.

## Execution

Run:

```bash
bun run uat:reference
```

Optional output path:

```bash
OWC_UAT_EVIDENCE_PATH=/approved/path/reference-uat.json bun run uat:reference
```

The runner exits unsuccessfully if any required reference scenario fails. The JSON includes suite mode, synthetic-data flag, `productionAcceptance=false`, release SHA when available, scenario outcomes and safe references.

## Manual review of automated evidence

Reviewers confirm:

- all seven scenarios are present;
- suite summary is PASS;
- mode is `REFERENCE/SANDBOX`;
- `syntheticData=true`;
- `productionAcceptance=false`;
- payment evidence states no real funds moved;
- no secret, production credential, real claimant evidence, medical detail or bank account data appears;
- release SHA matches the code under review.

## Reference UAT acceptance

Reference UAT is repository-complete when the exact-head CI run passes the reference suite and preserves the JSON artifact. This proves coherent functional behavior only.

It does **not** satisfy the separate production-like acceptance requirements for real OWC database/storage, Drupal/identity, CPPS/agency `LIVE UAT`, evidence scanning, notifications, infrastructure, accessibility/performance or business/security sign-off.

Any unavailable authoritative service must be recorded as **`BLOCKED/DEPENDENCY`** in formal UAT. Reference evidence may demonstrate the intended behavior but cannot be substituted as live acceptance.
