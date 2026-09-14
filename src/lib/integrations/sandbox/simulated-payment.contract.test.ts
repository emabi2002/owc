import { describe, expect, test } from "bun:test";
import { PRODUCTION_SERVICES } from "../production/registry";
import { processSandboxPayment } from "./agencies";
import { DEMO_BANK_ACCOUNT, DEMO_CLAIM_REFERENCE } from "./data";

const paymentInput = {
  idempotencyKey: "SIM-PAYMENT-CONTRACT-001",
  claimReference: DEMO_CLAIM_REFERENCE,
  accountReference: DEMO_BANK_ACCOUNT.accountReference,
  amountPgk: 4280.5,
};

describe("OWC simulated-only payment transactions", () => {
  test("removes payments from the production connector boundary", async () => {
    expect(PRODUCTION_SERVICES).not.toContain("payments");

    const types = await Bun.file("src/lib/integrations/production/types.ts").text();
    const env = await Bun.file("src/lib/env.ts").text();

    expect(types).not.toContain('| "payments"');
    expect(env).not.toContain("paymentApiBaseUrl");
    expect(env).not.toContain("paymentApiKey");
    expect(env).not.toContain("OWC_PAYMENT_API_BASE_URL");
    expect(env).not.toContain("OWC_PAYMENT_API_KEY");
  });

  test("generates a realistic transaction that explicitly moves no real money", () => {
    const result = processSandboxPayment(paymentInput);

    expect(result.source).toBe("sandbox");
    expect(result.service).toBe("bank");
    expect(result.operation).toBe("process_payment");
    expect(result.data.simulation).toBe(true);
    expect(result.data.moneyMovement).toBe(false);
    expect(result.data.status).toBe("SIMULATED");
    expect(result.data.currency).toBe("PGK");
    expect(result.data.transactionReference).toMatch(/^SIM-PAY-\d{4}-\d{8}$/);
    expect(result.data.receiptReference).toMatch(/^SIM-RCPT-\d{4}-\d{8}$/);
    expect(result.data.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.data.claimReference).toBe(DEMO_CLAIM_REFERENCE);
    expect(result.data.amountPgk).toBe(4280.5);
    expect(result.data.bankName).toBe(DEMO_BANK_ACCOUNT.bankName);
    expect(result.data.maskedAccountNumber).toBe(DEMO_BANK_ACCOUNT.maskedAccountNumber);
    expect(result.data).not.toHaveProperty("accountNumber");
  });

  test("returns the same synthetic transaction for duplicate idempotency keys", () => {
    const first = processSandboxPayment({
      ...paymentInput,
      idempotencyKey: "SIM-PAYMENT-CONTRACT-IDEMPOTENT",
    });
    const second = processSandboxPayment({
      ...paymentInput,
      idempotencyKey: "SIM-PAYMENT-CONTRACT-IDEMPOTENT",
    });

    expect(second.data.transactionReference).toBe(first.data.transactionReference);
    expect(second.data.receiptReference).toBe(first.data.receiptReference);
    expect(second.data.generatedAt).toBe(first.data.generatedAt);
    expect(first.data.duplicateRequest).toBe(false);
    expect(second.data.duplicateRequest).toBe(true);
    expect(second.data.simulation).toBe(true);
    expect(second.data.moneyMovement).toBe(false);
  });

  test("keeps the payment API on the guarded synthetic route with no external fetch", async () => {
    const route = await Bun.file(
      "src/app/api/integrations/bank/payments/process/route.ts",
    ).text();

    expect(route).toContain("handleSandboxPost");
    expect(route).toContain("processSandboxPayment");
    expect(route).not.toContain("fetch(");
    expect(route).not.toContain("getProductionConnectorConfig");
  });

  test("documents that real payment connectivity is outside demonstration scope", async () => {
    const path = "docs/operations/simulated-payment-transactions.md";
    expect(await Bun.file(path).exists()).toBe(true);
    const doc = (await Bun.file(path).text()).toLowerCase();

    expect(doc).toContain("simulated only");
    expect(doc).toContain("no real funds");
    expect(doc).toContain("no bank api");
    expect(doc).toContain("post-award");
  });
});
