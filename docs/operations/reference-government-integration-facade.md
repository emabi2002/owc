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
- **bank** — synthetic account verification and idempotent compensation-payment simulation only.
- **notifications** — synthetic email, SMS and in-app acceptance used by the integration demonstration workflow.

These services use deterministic fixture records and the existing cross-agency coherence checks. Payment results are always labelled simulated and do not move real funds. Notification results do not prove delivery by any carrier or provider.

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

The production integration registry remains authoritative for services that are actually in live-integration scope. **Payment execution is intentionally excluded from that production registry.** The OWC payment route is a simulator only: it generates synthetic references/receipts with `simulation: true` and `moneyMovement: false`, and it contains no bank/payment API connector.

A synthetic response must never be relabelled as a production response, and real claimant credentials or sensitive production datasets must not be copied into reference fixtures.

## post-award replacement

For NID, employer, insurance, medical and other formally approved integrations, post-award work may replace the relevant synthetic dependency with an accepted production adapter and credentials while preserving the OWC application contract where practicable.

Payment is different: real payment connectivity is outside the current scope. If OWC later decides post-award to add a real bank/payment integration, that is a separate future scope requiring explicit design and authorization, provider ownership, endpoint/schema agreement, security approval, DEV/UAT credentials, reconciliation and duplicate-payment controls, monitoring, formal UAT and production sign-off. The demonstration payment simulator must not be repurposed silently as a live financial connector.
