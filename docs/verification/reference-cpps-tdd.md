# Reference CPPS TDD Evidence

Branch: `feature/reference-cpps-ecosystem`

This record preserves the intentional RED→GREEN sequence used for the reference CPPS package. A failing run is accepted here only when the failure is the newly specified missing behavior and the existing baseline remains healthy.

## 1. Reference CPPS domain service

### RED

- CI run: `34758062129`
- Head: `aa777ed2d2fb8741149a824d0dd94649815f42a2`
- Expected failure: `src/lib/cpps/reference/service.test.ts` could not import `./service` because the reference implementation did not yet exist.
- Existing baseline: 121 existing tests passed before the new test failed.

### GREEN implementation

- Domain implementation commit: `67c8d0fde12e365d4d9088afd0c7d5bd96b0f199`
- Added typed lifecycle, deterministic reference claim registration, transition validation, reference-only assessment assumption and idempotent synthetic payment.

## 2. OWC claim-status contract mapper

### RED

- CI run: `34758249590`
- Head: `ab34c5fe1d60d88e6d5bb0ee10c6aea923bd2e67`
- Expected failure: `src/lib/cpps/reference/contract.test.ts` could not import `./contract`.
- Existing/reference baseline: 124 tests passed before the new contract test failed.

### GREEN implementation

- Mapper implementation commit: `29e29b67e34627d32061b5cce2b1419e3e6ef616`
- Added conversion from reference CPPS lifecycle to the existing OWC `CppsClaimStatus` contract, including rejected-claim behavior that does not falsely mark payment complete.

## 3. CPPS backend selection

### RED

- CI run: `34758312536`
- Head: `3d2a82e39df7a21aa2841cdc6125e10025c2c66e`
- Expected failure: `src/lib/cpps/backend-mode.test.ts` could not import `./backend-mode`.
- Baseline: 126 tests passed before the new selector test failed.

### GREEN implementation

- Selector implementation commit: `de118df69bbcf711daa14b466fb253dc824f7fa6`
- Rule: configured live CPPS always wins; explicitly enabled reference CPPS is second; otherwise CPPS is unavailable/fail-closed.
- `OWC_ENABLE_REFERENCE_ECOSYSTEM` defaults off and is server-side.

## 4. Reference employer, injury and enquiry services

### RED

- CI run: `34758396650`
- Head: `36cb248764bd2d4dc4b78ba4f7a4ecf4c7560082`
- Expected failures: `verifyEmployer`, `receiveInjuryReport` and `receiveEnquiry` had not yet been implemented.
- Baseline: 129 tests passed; exactly the two new behavior tests failed.

### GREEN implementation

- Service contract commit: `0ac93e8e9cb45c4a62c16fe7bc1ee981207f9f6f`
- Service implementation commit: `1c49dffdd72e2ed9a418979d17bc41f7dbea3dc6`
- Added deterministic synthetic employer verification and deterministic reference injury/enquiry receipts.

## 5. Stable OWC adapter

- Adapter commit: `0515144ba9ae9f977a50e559831ad719ec1a92fb`
- OWC claim lodgement, tracking, employer verification, injury reporting and enquiries now share the same live/reference/unavailable selection rule.
- The former random/mock successful fallback has been removed.
- CI run `34758468187` reached successful tests and lint/type-check on this adapter head before a newer branch commit superseded/cancelled the remaining workflow under branch concurrency.

## 6. Controlled reference HTTP façade

### RED

- CI run: `34758497794`
- Head: `5f41ceb2f96ec57154ada29e692330d4c0ef4304`
- Expected failure: `src/lib/cpps/reference/http.test.ts` could not import `./http`.
- Baseline: 131 tests passed; only the new HTTP boundary test failed.

### GREEN implementation

The implementation adds an explicit opt-in HTTP safety boundary and controlled reference routes. When disabled they return a non-disclosing 404; when enabled, responses remain labelled `reference`, `productionConnected: false`, and non-durable where appropriate.

## Final verification requirement

Before the CPPS package is preserved as a draft PR, the exact final branch head must complete:

- Bun tests;
- lint/type-check;
- Next.js production build;
- Drupal clean-room reconstruction.

Feature-branch CI must not trigger production deployment. Live CPPS connectivity/UAT is a separate external acceptance gate and is not established by this evidence.
