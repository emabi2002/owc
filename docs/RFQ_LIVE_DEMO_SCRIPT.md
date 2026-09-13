# OWC RFQ Live Demonstration Script

## Demonstration Objective

Show the Evaluation Committee that OWC is an integrated digital service platform, not a static website. The demonstration uses real application logic, REST APIs, validation, trace identifiers and transaction sequencing against controlled synthetic external systems.

**Presenter statement before the integration demo:**

> The OWC application you are seeing is a working system. For services owned by external organizations, this demonstration uses clearly identified sandbox APIs and synthetic records. These interfaces demonstrate the integration design and transaction flow. Production endpoints will be substituted only after the relevant agency authorizes access and completes interface testing.

## Suggested 30-Minute Technical Demonstration Segment

### 1. OWC Public Experience — 4 minutes

Show:
- responsive public portal;
- claims lodgement/tracking;
- employer services;
- publications, legislation, forms, tenders and search;
- explain that Drupal is the approved target enterprise CMS for controlled editorial content.

Key message: **one digital entry point for workers, employers and stakeholders.**

### 2. Administrative and Security Controls — 4 minutes

Show:
- staff console;
- RBAC roles;
- audit log;
- MFA-ready authentication;
- validation/rate limiting;
- UAT/production separation.

Key message: **OWC controls who can view, change, approve and administer information.**

### 3. Integration Control Centre — 3 minutes

Open `/admin/integrations`.

Point out:
- each external service carries a **SANDBOX** badge;
- health state;
- last operation;
- latency;
- transaction result;
- correlation ID.

Key message: **interfaces are observable and traceable, not hidden point-to-point calls.**

### 4. End-to-End Worker Claim Scenario — 12 minutes

Open `/admin/integrations/process` and run the worker-claim scenario. The legacy `/admin/integrations/demo` route redirects to this current presentation screen.

The synthetic scenario uses claim **`OWC-2026-005112`**, claimant **Mara Kila**, employed by **Pacific Engineering Ltd**.

Use the current coherent synthetic references shown on the screen:

1. **NID verification** — `NID-00010001` confirms claimant identity.
2. **IPA/employer verification** — `IPA-2020-1001` confirms employer registration.
3. **IRC compliance** — `TIN-90010001` confirms compliant status.
4. **Employer HR verification** — `EMP-0001001` confirms employment, position and synthetic wage information.
5. **Medical verification** — `MED-2026-00451` confirms a valid synthetic medical certificate.
6. **Insurance verification** — `WC-POL-2026-01872` confirms active synthetic workers compensation cover.
7. **Bank verification** — `BANK-ACC-7842` confirms the synthetic claimant account.
8. **Cross-agency reconciliation** — OWC confirms that the identity, employer, employment, medical, insurance and banking records belong to one coherent synthetic claim chain.
9. **Claim determination** — OWC records the demonstration determination for the claim.
10. **Payment simulation** — OWC issues a K18,450 sandbox payment instruction and receives a `TXN-2026-...` synthetic transaction reference. No real funds move.
11. **Notification** — a synthetic SMS notification is accepted by the sandbox notification service.
12. **Trace evidence** — the completed flow exposes correlation identifiers for the integration control centre without exposing sensitive payloads.

Key message: **one OWC workflow can orchestrate independently governed services while preserving source-of-truth boundaries.**

### 5. Traceability and Resilience — 4 minutes

Return to `/admin/integrations` and show the transactions created by the scenario.

Explain:
- every service call has a correlation ID;
- OWC can see operation outcome and latency;
- sensitive payloads are not dumped into the monitoring view;
- payment requests are idempotent, so repeated identical requests do not create duplicate simulated transactions;
- sandbox services are disabled by default and are not exposed when `OWC_ENABLE_SANDBOX` is false.

Key message: **security, traceability and recoverability are built into the integration pattern.**

### 6. Production Transition — 3 minutes

Explain the adapter model:

- Current demonstration: `OWC -> controlled sandbox API`.
- Production: `OWC -> authorized agency API`.
- OWC workflows and screens remain stable while the connector implementation changes.

State explicitly:

> No production connection to NID, IPA, IRC, a bank, insurer or medical provider is being claimed in this demonstration. The working sandbox proves the interface and orchestration model; production access remains subject to agency authorization, security approval and contract testing.

## Demonstration Recovery Plan

Before presentation:
- confirm the build and automated tests are green;
- enable `OWC_ENABLE_SANDBOX=true` only in the demo/UAT environment;
- verify `/api/integrations/health` reports all expected services;
- confirm `/admin/integrations` loads the integration control centre;
- confirm `/admin/integrations/process` loads the worker-claim process screen;
- run the scenario once using the current references above and confirm the control centre receives traces;
- confirm the result remains explicitly synthetic and no real payment or external agency transaction is claimed;
- refresh/reset the presentation screen before the panel arrives;
- retain screenshots/video as presentation fallback, but lead with the live system.

If an external production discussion arises, return to the architectural distinction: **sandbox interface proven; production authorization pending**.
