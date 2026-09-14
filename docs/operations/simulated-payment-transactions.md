# OWC Simulated Payment Transactions

## Scope

OWC payment processing in the demonstration environment is **simulated only**. The system generates realistic payment-transaction and receipt records so the full workers-compensation workflow can be demonstrated, but **no real funds** are transferred.

There is **no bank API**, payment-gateway API, internet-banking connection, direct-debit connection, card rail, mobile-money rail or financial-institution credential in the OWC production connector registry for payment execution.

## Demonstration transaction

`POST /api/integrations/bank/payments/process` remains behind the existing explicitly enabled sandbox boundary. A successful request generates a process-local synthetic transaction containing:

- a `SIM-PAY-YYYY-NNNNNNNN` transaction reference;
- a `SIM-RCPT-YYYY-NNNNNNNN` receipt reference;
- the OWC claim reference;
- PGK amount and `currency: "PGK"`;
- the synthetic bank name and masked demonstration account number;
- generation timestamp;
- `status: "SIMULATED"`;
- `simulation: true`;
- `moneyMovement: false`.

The response never exposes an unmasked account number and never calls an external financial endpoint.

## Idempotency

The caller supplies an idempotency key. Repeating a request with the same key returns the same simulated transaction and receipt references with `duplicateRequest: true`. This demonstrates duplicate-payment protection without creating a second dummy payment.

The transaction map is process-local and non-durable. Restarting the reference service resets synthetic transactions. These records are presentation/test artifacts and must never be reconciled as accounting evidence or proof of settlement.

## Demonstration workflow

The presentation flow is:

1. claim is assessed and approved;
2. the synthetic bank account is verified against demonstration fixtures;
3. OWC generates a simulated payment transaction;
4. a synthetic receipt/reference is returned;
5. the claimant notification records that a demonstration transaction was generated;
6. no financial institution is contacted and no real funds move.

## Production and post-award boundary

Real payment connectivity is outside the current OWC system scope. Production/reference configuration therefore contains no payment API base URL or payment API key and no production payment connector.

If, **post-award**, OWC later formally changes scope to require direct payment integration, that must be treated as a separately designed and approved integration with the nominated financial authority/provider, its own security assessment, reconciliation controls, credentials, UAT and explicit production authorization. It must not be activated by repurposing the demonstration simulator.
