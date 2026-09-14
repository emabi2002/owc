# OWC Demonstration Presentation Script

## Presentation boundary

Open by stating: **DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS**.

Everything shown in this session is deterministic presentation data. No record represents a real claimant, employer, medical record, bank account, agency confirmation or financial settlement. `productionAcceptance=false`. Simulated payment evidence always uses `simulation=true` and `moneyMovement=false`.

The application repository can be presentation-ready independently of the presentation server. Until an actual OWC demonstration host is configured and independently verified, the host state remains **DEMO_HOST_EXTERNAL**.

## Personas

Use the existing configured demonstration identities. Credentials and MFA values are deliberately not documented here.

1. **Administrator — Miriam Kila**: start at `/admin/demonstration`. Show the cockpit, lifecycle totals, payment boundary and guarded sandbox failure/recovery controls.
2. **Claims Officer — Peter Wama**: use `/admin/demonstration/officer?persona=claims-officer`. Show received and document-required work only.
3. **Assessment Officer — Lucy Arore**: use `/admin/demonstration/officer?persona=assessment-officer`. Show the assessment queue and separation from finance duties.
4. **Finance Officer — John Kera**: use `/admin/demonstration/officer?persona=finance-officer`. Show approved, payment-scheduled and simulated-payment records. State that the values are illustrative and no real funds move.
5. **Content Editor — Anna Teme**: use `/admin/content` to demonstrate the editorial/CMS workflow separately from claim processing.
6. **Employer Representative — Daniel Pako**: use the employer presentation journey to explain employer-side claim/evidence visibility.
7. **Claimant Worker — Michael Kora**: use the claimant presentation journey to explain claim lodgement, status visibility and evidence submission.

## Seven presentation scenarios

Run the scenarios in this order so the audience sees both normal flow and controlled failure behaviour.

### DEMO-UAT-001 — Successful claim

Show a coherent synthetic worker/employer claim proceeding through verification, assessment and a simulated payment. Point out the simulation marker and the absence of real financial settlement.

### DEMO-UAT-002 — Missing documents

Open a `DOCUMENTS_REQUIRED` claim and explain that assessment cannot be completed while required evidence remains outstanding.

### DEMO-UAT-003 — Identity mismatch

Use the deterministic mismatch scenario. Explain that processing stops at identity validation and does not proceed to downstream agency checks or payment.

### DEMO-UAT-004 — Infected evidence

Show the harmless deterministic test marker being classified as infected by the reference scanner. Explain that the evidence is blocked without contacting a production malware service.

### DEMO-UAT-005 — Declined claim

Show a declined claim. Confirm that the decision is recorded and that no payment evidence is created.

### DEMO-UAT-006 — Simulated-payment idempotency

Run the same deterministic simulated-payment request twice. Show that only one synthetic transaction record exists and repeat processing returns the same simulated transaction reference.

### DEMO-UAT-007 — Service outage and recovery

As the Administrator, use the demonstration service controls to mark one sandbox service offline. Show the controlled failure, then return it to `online` and repeat the scenario. These controls affect process-local sandbox state only; `productionConnected=false`.

## Recovery and reset

If presentation state becomes unsuitable, use the guarded Administrator-only whole-demonstration reset. The reset restores deterministic identity audit state, reference CPPS, reference evidence, notifications, simulated payments, integration traces and sandbox service health. It must never be represented as a production reset mechanism.

## Closing statement

The demonstration proves the repository-side presentation workflow, deterministic data pack, reference integrations, failure/recovery behaviour and evidence controls. It does not constitute production acceptance, live agency certification, financial settlement certification or proof of an OWC-hosted deployment. The release evidence must therefore retain `productionAcceptance=false` and, while no independently verified presentation host exists, `REPOSITORY_READY / DEMO_HOST_EXTERNAL`.
