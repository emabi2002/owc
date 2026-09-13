# Reference CPPS Ecosystem Design

## Purpose

Build a realistic, explicitly synthetic Compensation Processing & Payment System (CPPS) reference implementation inside the OWC solution so the complete OWC claim lifecycle can be developed and tested before the actual internal CPPS API, database and credentials are available.

This reference implementation is not evidence of a live OWC CPPS. Every response must identify itself as `reference`, and production readiness must continue to require formal connection and contract verification against the real CPPS.

## Architecture

The existing OWC portal remains the system of engagement. The existing `src/lib/cpps/api.ts` remains the stable OWC-facing adapter. When a live CPPS endpoint is configured it uses the external CPPS. When no live endpoint is configured and the reference ecosystem is enabled, it delegates to a reference CPPS domain service rather than generating ad-hoc mock values.

The reference CPPS consists of focused modules:

- `src/lib/cpps/reference/types.ts` — reference-only domain types and states.
- `src/lib/cpps/reference/store.ts` — deterministic synthetic seed plus process-local repository abstraction for demo/UAT.
- `src/lib/cpps/reference/service.ts` — claim registration, status retrieval, assessment, approval, payment scheduling/payment and audit-event transitions.
- `src/lib/cpps/reference/contract.ts` — conversion from the richer reference model into the existing OWC CPPS contract.
- `src/app/api/reference/cpps/*` — HTTP façade for integration/demo testing, disabled unless the reference ecosystem is explicitly enabled.

The design deliberately keeps the public OWC claim APIs stable. The production adapter can later be mapped to the real CPPS without rewriting claimant-facing flows.

## Reference Claim Lifecycle

The assumed CPPS lifecycle is:

1. `received` — claim registered.
2. `registration_review` — worker/employer identity and registration checks.
3. `medical_review` — injury/medical evidence review.
4. `assessment` — eligibility and compensation assessment.
5. `approved` or `rejected` — authorized decision.
6. `payment_scheduled` — approved compensation queued for payment.
7. `paid` — synthetic payment reference recorded.
8. `closed` — claim administratively completed.

Transitions are explicit and validated. The reference service must reject impossible transitions rather than silently skipping states.

## Compensation Assumption

For the reference ecosystem only, assessment may calculate an indicative compensation amount from weekly wage and an assumed number of compensable weeks. This formula is demonstrative and must be labelled as an assumption; it is not a statement of PNG statutory entitlement and must not be reused as a legal rule in production without OWC validation.

## Data and Safety Rules

- Synthetic data only.
- No real payment rail or bank transfer.
- Synthetic payment references are idempotent for a claim.
- Correlation/audit events contain operational metadata and workflow state, not unrestricted medical or banking payloads.
- The reference HTTP façade is disabled by default.
- The reference implementation never causes `PRODUCTION CONNECTED` status.
- Live CPPS configuration always takes precedence over the reference service.

## OWC Contract Compatibility

The reference service must satisfy the existing OWC calls for:

- claim lodgement;
- claim status tracking;
- employer registration verification;
- injury report receipt;
- enquiry receipt.

`CppsResult.source` is expanded from `cpps | mock` to `cpps | reference`; the old generic mock source is removed from CPPS behavior once the reference service is active.

## Testing

Tests must cover:

- deterministic claim registration and retrieval;
- legal and illegal lifecycle transitions;
- assessment calculation with explicit assumptions;
- idempotent synthetic payment;
- adapter conversion to existing OWC tracking shape;
- live CPPS precedence over reference mode;
- disabled reference HTTP façade behavior;
- no claim that reference data is production data.

## Production Migration

When the real CPPS becomes available, OWC will obtain the actual API specification, authentication method, UAT endpoint and test identities. A mapping matrix will compare the real contract to this reference contract. The live adapter will be changed behind `src/lib/cpps/api.ts`; the OWC claimant and officer workflows remain unchanged unless the real CPPS exposes a materially different business requirement.
