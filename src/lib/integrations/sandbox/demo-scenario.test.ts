import { describe, expect, test } from "bun:test";
import { runWorkerClaimDemo } from "./demo-scenario";

describe("OWC end-to-end integration workflow", () => {
  test("runs the worker compensation claim workflow in order", () => {
    const result = runWorkerClaimDemo();

    expect(result.status).toBe("completed");
    expect(result.claimReference).toBe("OWC-2026-005112");
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
    expect(result.paymentTransactionReference).toMatch(/^TXN-2026-/);
  });

  test("stops before downstream checks when identity cannot be verified", () => {
    const result = runWorkerClaimDemo({ nid: "NID-00019999" });

    expect(result.status).toBe("stopped");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({ key: "identity", status: "failed" });
    expect(result.paymentTransactionReference).toBeNull();
  });

  test("reuses the same payment transaction for a repeated claim run", () => {
    const first = runWorkerClaimDemo();
    const second = runWorkerClaimDemo();

    expect(second.paymentTransactionReference).toBe(first.paymentTransactionReference);
  });
});
