# OWC Reference CPPS — Operations and UAT Guide

## Purpose

The OWC Reference CPPS is an explicitly synthetic implementation of the **Compensation Processing & Payment System (CPPS)** used to develop and test the OWC ecosystem before the authoritative internal CPPS API, database, credentials and UAT environment are supplied.

It is a development/UAT reference service. It is **not** the real OWC CPPS, is **not** durable storage, does **not** move real funds, and must never be described as production connected.

## Enabling reference mode

Reference mode is disabled by default:

```env
OWC_ENABLE_REFERENCE_ECOSYSTEM="false"
```

Enable it only in an approved development/UAT/demo environment:

```env
OWC_ENABLE_REFERENCE_ECOSYSTEM="true"
```

Backend selection is deterministic:

1. If `CPPS_API_BASE_URL` is configured, the live CPPS adapter takes precedence.
2. If live CPPS is absent and `OWC_ENABLE_REFERENCE_ECOSYSTEM=true`, OWC uses the reference CPPS.
3. If neither is available, CPPS-dependent operations fail closed. OWC does not fabricate successful mock responses.

## Reference lifecycle

The assumed CPPS lifecycle is:

`received → registration_review → medical_review → assessment → approved/rejected`

Approved claims continue:

`approved → payment_scheduled → paid → closed`

Rejected claims continue:

`rejected → closed`

The service validates transitions and rejects impossible jumps.

## Reference assessment rule

The reference assessment can calculate an indicative amount as:

`weekly wage × assumed compensable weeks`

Every such calculation is labelled **REFERENCE ASSUMPTION ONLY**. It is not a statutory entitlement rule, legal interpretation or production compensation formula. The real CPPS/business rules must replace or validate this assumption during authoritative CPPS discovery.

## Synthetic payment

A reference claim may receive a synthetic payment reference after it reaches `payment_scheduled`. Repeating the payment operation is idempotent and returns the same reference. The reference record always states `realFundsMoved: false`.

## Reference employer and receipts

The reference service contains a synthetic compliant employer used for integration testing:

- Name: `Pacific Engineering Demo Ltd`
- Registration: `CPPS-EMP-REF-0001`
- Status: `Compliant`

Reference injury and enquiry receipts are deterministic and visibly synthetic (`INJ-REF-*`, `ENQ-REF-*`).

## OWC adapter behavior

The public OWC portal continues to call the stable server boundary in `src/lib/cpps/api.ts` for:

- claim lodgement;
- claim tracking;
- employer verification;
- workplace injury reports;
- enquiries.

Those public workflows do not need to know whether the backing implementation is the real CPPS or the reference CPPS. Every returned result still carries its data source (`cpps` or `reference`).

## Controlled reference HTTP façade

When reference mode is enabled, the following UAT/demo endpoints are available:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/reference/cpps/health` | GET | Shows safe reference-service health metadata |
| `/api/reference/cpps/claims` | POST | Registers a validated synthetic reference claim |
| `/api/reference/cpps/claims/{reference}` | GET | Returns claimant-safe reference claim status |

When reference mode is disabled these routes return a non-disclosing `404`.

Reference HTTP responses explicitly state:

- `source: "reference"`;
- `productionConnected: false`;
- `durable: false` where relevant.

The routes are rate-limited and claim registration reuses the existing OWC Zod validation/sanitisation schema.

## Durability boundary

The current reference CPPS store is process-local memory. Restarting/redeploying the application clears reference records. This is intentional: it prevents the reference implementation from silently becoming an unofficial CPPS database.

If durable reference/UAT storage is later needed, it must be added as a separate environment-specific repository with the same `reference` labeling and without changing production acceptance criteria.

## Migration to the authoritative CPPS

When OWC supplies the real CPPS documentation/access, complete the following mapping exercise before production acceptance:

1. Obtain approved DEV/UAT/PROD endpoints and system owner/contact.
2. Obtain API/OpenAPI/GraphQL/schema documentation and version.
3. Confirm authentication, credential rotation and network controls.
4. Map claim reference, claimant/employer, injury, lifecycle/status, assessment/decision and payment fields.
5. Compare actual CPPS state transitions and business rules against the reference lifecycle.
6. Remove or revise any assumptions that differ from authoritative CPPS behavior.
7. Execute contract tests against CPPS UAT using approved synthetic/test data.
8. Verify retries, timeout/error semantics, idempotency and reconciliation rules.
9. Complete security review and business UAT.
10. Record formal acceptance before describing the integration as production connected.

## Production acceptance rule

A working reference CPPS proves the OWC application contract and user journey can operate end-to-end. It does **not** prove live CPPS connectivity. Production acceptance still requires the actual CPPS endpoint/environment, approved credentials, authoritative contract/schema, successful UAT and formal OWC acceptance.
