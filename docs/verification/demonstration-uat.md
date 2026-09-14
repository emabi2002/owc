# OWC Presentation-Level Demonstration UAT

This verification package records presentation-level acceptance for the **OWC DEMONSTRATION environment only**.

## Acceptance boundary

- `environment=DEMONSTRATION`
- `syntheticData=true`
- `demonstrationAcceptance=true` only when every required scenario passes
- `productionAcceptance=false` in all cases
- No real funds are transferred, settled or instructed by this suite.
- Simulated payment evidence must always record `simulation=true` and `moneyMovement=false`.

Passing this suite proves that the repository can execute the agreed presentation scenarios against deterministic demonstration/reference integrations. It does **not** prove production infrastructure, production integrations, live identity services, live financial settlement, or an externally hosted OWC presentation server.

## Required scenarios

The suite executes seven deterministic scenarios:

1. Successful claim from verification through simulated payment.
2. Missing documents hold a claim before determination.
3. Identity mismatch stops downstream claim processing.
4. Infected evidence is detected using the harmless deterministic reference marker and is blocked.
5. Declined claim records a decision without payment.
6. Simulated-payment idempotency prevents duplicate payment records.
7. External-service outage and recovery return the sandbox to a clean presentation state.

## Running the suite

```bash
bun run uat:demonstration
```

By default the evidence file is written to:

```text
artifacts/demonstration-uat-evidence.json
```

To write it elsewhere, set `OWC_DEMONSTRATION_UAT_EVIDENCE_PATH`.

The runner links the evidence to `GITHUB_SHA` when available, otherwise to the local `git rev-parse HEAD`. The evidence file is created with restricted permissions and contains no production credentials.

## Interpretation

A passing result means `demonstrationAcceptance=true` for the exact repository revision recorded in the evidence. `productionAcceptance=false` remains mandatory. The OWC demonstration release therefore remains `DEMO_HOST_EXTERNAL` until a real presentation host is explicitly configured and independently verified.
