# OWC Production Integration Hub Design

## Purpose
Provide the production-safe transport and governance boundary through which OWC will connect to NID/identity, employer/business registry, insurer, finance/payment and medical-provider systems without coupling portal code directly to external agencies.

## Architecture
The Integration Hub is a server-only adapter layer under `src/lib/integrations/production/`. Each external system is registered by a stable service key and configured from server environment variables. The browser and mobile PWA continue to call OWC APIs only.

The hub does not guess agency payload schemas. It provides reusable HTTP transport, authentication headers, correlation IDs, timeout handling, normalized success/failure envelopes and a readiness registry. Agency-specific adapters may be added only when an authoritative API/schema is available.

## Service keys
- `nid` — claimant identity verification
- `employerRegistry` — employer/business registration verification
- `insurance` — insurer/policy verification
- `payments` — finance/bank/payment integration
- `medical` — medical-provider verification/exchange

CPPS remains separate and authoritative for claims/payment records; the existing CPPS abstraction is not replaced by this work package.

## Configuration
Each service supports a server-only base URL and optional bearer API key. No credential may use a `NEXT_PUBLIC_*` variable. Missing configuration produces an explicit `configuration-required` state and no outbound request.

## Transport behavior
- HTTPS is required for configured production endpoints, except explicitly local development endpoints.
- Default request timeout is 10 seconds and is bounded.
- Callers receive a normalized envelope containing service, operation, correlation ID, timestamp, status and data/error; credentials and raw authorization headers are never returned.
- Non-2xx upstream responses are normalized to `upstream-error`; network/timeouts become `unavailable`.
- One failing external service does not affect other connector calls.
- Request bodies are JSON unless a future documented agency adapter requires another format.

## Telemetry boundary
Only safe operational metadata is emitted: service key, operation, correlation ID, outcome, HTTP status when available and duration. No claimant medical, identity, banking or credential payload is written into the telemetry object.

## Testing
TDD must prove: missing config prevents network calls; HTTPS policy; bearer auth remains server-side; success normalization; timeout/upstream error isolation; telemetry contains no request/response payload; registry accurately reports configured vs configuration-required services.

## External dependency rule
This foundation does not claim any agency is production-connected. NID, employer registry, insurer, payment and medical adapters remain configuration/schema dependencies until OWC receives approved endpoints, credentials and API contracts.