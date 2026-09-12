import { describe, expect, test } from "bun:test";
import { runWorkerClaimDemo } from "./demo-scenario";

describe("OWC end-to-end integration demo", () => {
  test("runs the approved worker claim demonstration in order", () => {
    const result = runWorkerClaimDemo();

    expect(result.status).toBe("completed");
    expect(result.claimReference).toBe("OWC-DEMO-CLAIM-0001");
    expect(result.steps.map((step) => step.key)).toEqual([
      "identity",
      "employer_registry",
      "tax_compliance",
      "employment",
      "medical",
      "insurance",
      "bank_account",
      "payment",
      "notification",
    ]);
    expect(result.steps.every((step) => step.status === "passed")).toBe(true);
    expect(result.paymentTransactionReference).toMatch(/^TXN-DEMO-/);
  });

  test("stops before downstream checks when identity cannot be verified", () => {
    const result = runWorkerClaimDemo({ nid: "NID-DEMO-MISSING" });

    expect(result.status).toBe("stopped");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({ key: "identity", status: "failed" });
    expect(result.paymentTransactionReference).toBeNull();
  });

  test("reuses the same simulated payment for a repeated claim run", () => {
    const first = runWorkerClaimDemo();
    const second = runWorkerClaimDemo();

    expect(second.paymentTransactionReference).toBe(first.paymentTransactionReference);
  });
});
