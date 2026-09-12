# OWC Integration Sandbox

## Purpose

The OWC Integration Sandbox is the controlled external-systems environment used for the RFQ live demonstration and non-production integration testing. It proves that the OWC portal can orchestrate standards-based API calls across multiple systems without claiming or requiring production access to external agencies.

> **Important:** Every service in this sandbox uses synthetic demonstration data. A working sandbox connector is not evidence of production authorization from NID, IPA, IRC, a bank, insurer, medical provider, employer, or any other external organization.

## Enabling the Sandbox

The sandbox is disabled by default. Enable it only in a controlled development/UAT/demo environment:

```env
OWC_ENABLE_SANDBOX="true"
```

When disabled, sandbox API routes return a non-disclosing HTTP 404.

## Synthetic Demonstration Scenario

The coherent demo dataset uses the following identifiers:

| Domain | Synthetic Identifier | Demonstration Record |
| --- | --- | --- |
| National Identity | `NID-DEMO-0001` | Mara Kila |
| IPA / Employer Registry | `IPA-DEMO-1001` | Pacific Engineering Demo Ltd |
| IRC | `TIN-DEMO-9001` | Compliant demo taxpayer |
| Employer HR | `EMP-DEMO-001` | Heavy Equipment Operator, K2,400 fortnightly |
| Medical | `MED-DEMO-001` | Valid workplace injury certificate |
| Insurance | `POL-DEMO-001` | Active workers compensation policy |
| Bank | `BANK-DEMO-001` | Verified masked account `****7842` |
| OWC Claim | `OWC-DEMO-CLAIM-0001` | Synthetic worker claim |

Names and records are created solely for this demonstration. They must not be replaced with real personal information.

## API Endpoints

All service endpoints below are POST JSON except health and telemetry. They use the existing OWC rate-limit and validation patterns.

| Service | Endpoint | Request |
| --- | --- | --- |
| Health | `GET /api/sandbox/health` | none |
| NID verification | `POST /api/sandbox/nid/verify` | `{ "nid": "NID-DEMO-0001" }` |
| IPA employer | `POST /api/sandbox/ipa/company` | `{ "registrationNo": "IPA-DEMO-1001" }` |
| IRC compliance | `POST /api/sandbox/irc/compliance` | `{ "tin": "TIN-DEMO-9001" }` |
| Employer HR | `POST /api/sandbox/employer/employee` | `{ "employeeNo": "EMP-DEMO-001" }` |
| Medical certificate | `POST /api/sandbox/medical/certificate` | `{ "certificateNo": "MED-DEMO-001" }` |
| Insurance policy | `POST /api/sandbox/insurance/policy` | `{ "policyNo": "POL-DEMO-001" }` |
| Bank account | `POST /api/sandbox/bank/account` | `{ "accountReference": "BANK-DEMO-001" }` |
| Payment | `POST /api/sandbox/bank/payment` | claim reference, account reference, amount and idempotency key |
| Notification | `POST /api/sandbox/notifications/send` | channel, recipient, event and message |
| Telemetry | `GET /api/sandbox/events` | none |
| Full scenario | `POST /api/sandbox/demo/run` | none |

## Response Contract

Every synthetic service response is wrapped in trace metadata:

```json
{
  "source": "sandbox",
  "service": "nid",
  "operation": "verify_identity",
  "correlationId": "OWC-DEMO-...",
  "timestamp": "2026-09-12T01:00:00.000Z",
  "data": {}
}
```

The `source` field must remain visible to downstream systems so demonstration data cannot be mistaken for production agency data.

## Payment Safety

The bank service never moves real money. `processSandboxPayment()` creates a synthetic transaction reference such as `TXN-DEMO-000001`. The payment operation is idempotent: repeating the same idempotency key returns the same demonstration transaction reference.

## Integration Control Centre

Authenticated OWC staff can use:

- `/admin/integrations` — service health and recent safe transaction telemetry.
- `/admin/integrations/demo` — guided end-to-end worker-claim demonstration.

The monitor deliberately records only trace metadata such as service, operation, status, latency and correlation ID. It does not record unrestricted identity, medical, banking or claim payloads.

## Production Migration Pattern

The sandbox establishes the interface pattern, not the final external connection. The intended transition is:

`OWC workflow -> sandbox adapter` **during demo/UAT**

then, after authorization and contract testing:

`OWC workflow -> production agency adapter`

The OWC user journey should not need to be rewritten simply because the backing provider changes.

Recommended evaluator-facing status language:

- **SANDBOX CONNECTED** — working controlled demonstration API.
- **PRODUCTION API PENDING AGENCY AUTHORIZATION** — no claim of live access.
- **PRODUCTION CONNECTED** — use only after OWC has evidence of approved live connectivity.
