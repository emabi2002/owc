# OWC Production Integration Hub — Operations Runbook

This runbook defines the configuration and verification boundary for OWC external-agency integrations. The Integration Hub is server-only infrastructure. Browser and mobile clients continue to call OWC APIs; they do not receive external-agency credentials or connect directly to agency systems.

## Registered services

The current production registry contains five deliberately generic service classes:

- `nid` — identity/NID verification
- `employerRegistry` — employer/business registry verification
- `insurance` — insurer/policy verification
- `payments` — finance/bank/payment integration
- `medical` — medical-provider verification/exchange

These service keys are integration boundaries, not claims that a particular PNG agency endpoint or data schema has been approved. CPPS remains separate and authoritative for claims/payment records.

## Server-only configuration

Configure only on the OWC server/runtime secret store:

- `OWC_NID_API_BASE_URL`
- `OWC_NID_API_KEY`
- `OWC_EMPLOYER_REGISTRY_API_BASE_URL`
- `OWC_EMPLOYER_REGISTRY_API_KEY`
- `OWC_INSURANCE_API_BASE_URL`
- `OWC_INSURANCE_API_KEY`
- `OWC_PAYMENT_API_BASE_URL`
- `OWC_PAYMENT_API_KEY`
- `OWC_MEDICAL_API_BASE_URL`
- `OWC_MEDICAL_API_KEY`

Do not expose these values through `NEXT_PUBLIC_*`, Drupal content, client-side bundles, logs, support screenshots, test fixtures, or source control. API keys are optional at the generic transport layer because an approved agency may later require another server-side authentication mechanism; agency-specific authentication must only be implemented from an authoritative interface specification.

## Endpoint policy

Production endpoints must use HTTPS. Plain HTTP is accepted only for explicit local development hosts. Missing or invalid configuration blocks the outbound request before `fetch` executes.

The generic transport provides:

- a 10-second default timeout;
- generated correlation IDs;
- JSON request bodies;
- optional server-side bearer authentication;
- normalized success, configuration, upstream-error and unavailable states;
- safe errors that do not copy upstream payloads into the result;
- metadata-only telemetry.

It does **not** invent agency-specific request/response fields, transform unknown agency schemas, or certify an endpoint as operational merely because a URL is present.

## Readiness interpretation

The System Operations readiness model counts how many of the five registered service endpoints have a base URL configured. All five must be configured before the Integration Hub summary becomes `ready`.

`ready` at this layer means configuration is present. It does not mean that OWC has completed agency onboarding, credential acceptance, schema certification, UAT, security approval, or production cutover. Those remain explicit external acceptance gates.

## Agency onboarding checklist

For each service, obtain and retain approved evidence of:

1. agency/system owner and technical contact;
2. DEV/UAT/production base URLs;
3. authoritative API/interface specification and version;
4. authentication method and credential-rotation process;
5. network allow-list/VPN/private-link requirements where applicable;
6. request/response field classification and minimum-data rules;
7. timeout, retry, rate-limit and availability expectations;
8. test identities/accounts and non-production sample data;
9. error-code catalogue and support/escalation process;
10. formal UAT/security/production acceptance.

Do not add an agency-specific adapter until the corresponding approved interface specification is available.

## Safe smoke-test procedure

Perform smoke tests in DEV/UAT before production:

1. configure the UAT endpoint and credentials in the runtime secret store;
2. confirm the OWC readiness view reports the endpoint as configured without exposing credentials;
3. invoke only a documented, non-destructive UAT operation through an OWC server route;
4. verify HTTPS, correlation ID propagation, timeout behavior and expected authentication;
5. verify success/error normalization against the agency specification;
6. inspect telemetry and logs to confirm claimant payloads, medical information, banking data and credentials are absent;
7. test endpoint-unavailable, timeout, invalid-credential and upstream-error conditions;
8. capture UAT evidence and agency acceptance before enabling production routing.

## Repository verification

Run:

```bash
bun test
bun run lint
bun run typecheck
bun run build
```

GitHub Actions must also complete the existing Drupal clean-room reconstruction. Feature branches must not execute the Ubuntu production deployment job.

## External dependencies

The repository does not provide or fabricate the following: OWC production Supabase/storage, NID/identity endpoint, employer/business registry endpoint, insurer API, finance/payment gateway, medical-provider interface, agency credentials, approved API schemas, private network connectivity, production DNS/TLS, or formal security/UAT approval.

Until those dependencies are supplied and verified, the relevant connectors must remain configuration-required or configuration-only and must not be described as live integrations.
