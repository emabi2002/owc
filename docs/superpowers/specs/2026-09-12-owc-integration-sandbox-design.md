# OWC Integration Sandbox & Live Demonstration Design

## Purpose
Build a controlled, realistic demonstration ecosystem around the existing OWC platform so the RFQ live presentation shows real API calls, real transaction flows, traceability and service orchestration rather than a front-end-only concept.

## Scope
The sandbox will represent external systems with synthetic data and clearly label every non-production service as SANDBOX. The initial services are NID identity verification, IPA/employer registry, IRC compliance, employer HR/payroll, medical provider, insurance, banking/payment and notifications. CPPS remains a separate authoritative claims integration domain and is never silently replaced by sandbox data.

## Architecture
- Existing Next.js OWC portal remains the user-facing digital experience.
- A new OWC integration sandbox service layer exposes stable REST contracts for each simulated agency/service.
- External-agency demo services are logically isolated and use synthetic records only.
- The OWC application consumes sandbox services through adapters rather than directly reading sandbox datasets.
- Each request returns source metadata identifying SANDBOX vs configured production integration.
- A presentation-facing Integration Monitor shows health, latency, source, transaction/correlation identifiers and latest activity.
- All failure states are explicit and support graceful degradation demonstrations.

## Demo Scenario
The principal scripted scenario is a worker claim:
1. Verify claimant identity through NID sandbox.
2. Verify employer registration through IPA sandbox.
3. Verify tax/TIN compliance through IRC sandbox.
4. Verify current employment and wage details through employer HR sandbox.
5. Verify medical certificate through medical-provider sandbox.
6. Verify employer insurance policy through insurance sandbox.
7. Complete claims assessment through OWC/CPPS workflow.
8. Verify claimant bank account and issue a simulated payment instruction.
9. Send simulated email/SMS notifications.
10. Display integration trace and outcome in the OWC Integration Monitor.

## Security & Truthfulness
- No sandbox endpoint or UI may imply production access to IRC, NID, BPNG, IPA, hospitals, insurers or banks.
- Synthetic records must not use real personal data.
- Secrets are server-only and never committed.
- API responses expose only minimum data needed for the demo.
- Integration logs contain metadata and correlation IDs, not unrestricted sensitive payloads.

## Implementation Boundary
The first sub-project delivers the sandbox framework, typed contracts, synthetic datasets, API endpoints, integration-monitor page and tests. Drupal, secure claims-document management and real CPPS production connectivity remain separate follow-on workstreams.

## Acceptance Criteria
- All sandbox services respond through documented REST endpoints.
- A single synthetic claimant/employer scenario can complete identity, employer, tax, employment, medical, insurance, bank and notification checks.
- Each response identifies `source: "sandbox"` and a correlation ID.
- Health endpoint reports all configured sandbox services.
- Integration Monitor visibly distinguishes SANDBOX services.
- Failure simulation can mark a service unavailable without breaking unrelated services.
- Tests cover successful lookup, not-found behavior, disabled/unavailable service behavior and payment idempotency.
