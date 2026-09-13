# OWC Reference Government Integration Facade

## Purpose

The OWC reference government integration facade provides a controlled, **synthetic** presentation surface for the external checks used by the worker-compensation journey before approved production integrations are available. It reuses the existing sandbox services and does not contact real government, medical, insurer, employer, bank or messaging systems.

The facade is disabled by default through `OWC_ENABLE_SANDBOX=false`. When disabled, the shared sandbox HTTP boundary returns the existing non-disclosing response rather than exposing synthetic service behavior.

## Demonstration services

The reference surface covers:

- **NID** — synthetic claimant identity verification.
- **IPA** — synthetic employer/company registration verification.
- **IRC** — synthetic taxpayer/compliance verification.
- **employment** — synthetic employment and wage verification.
- **medical** — synthetic medical-certificate verification.
- **insurance** — synthetic workers-compensation insurance verification.
- **bank** — synthetic account verification and idempotent compensation-payment simulation.
- **notifications** — synthetic email, SMS and in-app acceptance used by the integration demonstration workflow.

These services use deterministic fixture records and the existing cross-agency coherence checks. Payment results do not move real funds, and notification results do not prove delivery by any carrier or provider.

## HTTP safety boundary

Every route uses `handleSandboxPost`, so the same controls apply consistently:

1. the sandbox must be explicitly enabled;
2. the requested synthetic service must be online;
3. the request is rate limited;
4. the request body must pass its bounded Zod schema;
5. only the named in-process operation is called;
6. responses retain the `source: "sandbox"` envelope and correlation metadata.

There is no arbitrary target URL, generic proxy or user-supplied upstream host. The reference facade therefore cannot be used to pivot into an external network service.

## Presentation routes

- `POST /api/integrations/nid/verify`
- `POST /api/integrations/employers/verify`
- `POST /api/integrations/irc/compliance`
- `POST /api/integrations/employment/verify`
- `POST /api/integrations/medical/verify`
- `POST /api/integrations/insurance/verify`
- `POST /api/integrations/bank/accounts/verify`
- `POST /api/integrations/bank/payments/process`
- `POST /api/integrations/notifications/send`

The claim orchestration, health and event endpoints remain the presentation-level view across these services.

## Production boundary

The facade is demonstration infrastructure only. It is not evidence that NID, IPA, IRC, an employer/payroll system, a medical provider, an insurer, a bank/payment rail or a notification provider has approved or connected to OWC.

The production integration registry and provider-specific connectors remain the authoritative post-award path. A synthetic response must never be relabelled as a production response, and real claimant credentials or sensitive production datasets must not be copied into reference fixtures.

## post-award replacement

During post-award integration, replace each synthetic dependency with its approved production adapter and credentials while preserving the OWC application contract where practicable. Production acceptance requires agency/provider ownership, endpoint and schema agreement, security approval, DEV/UAT credentials, negative-path testing, reconciliation evidence, monitoring, retry/idempotency behavior where applicable, and formal sign-off.
