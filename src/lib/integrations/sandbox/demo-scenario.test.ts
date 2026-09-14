import { describe, expect, test } from "bun:test";
import { runWorkerClaimDemo } from "./demo-scenario";

describe("OWC end-to-end integration workflow", () => {
  test("runs the worker compensation claim workflow in order", () => {
    const result = runWorkerClaimDemo();

    expect(result.status).toBe("completed");
    expect(result.claimReference).toBe("OWC-2026-005112");
    expect(result.steps.map((step) => step.key)).toEqual([
      "claim_registration",
      "identity",
      "employer_registry",
      "tax_compliance",
      "employment",
      "medical",
      "insurance",
      "bank_account",
      "record_reconciliation",
      "determination",
      "payment",
      "notification",
    ]);
    expect(result.steps.every((step) => step.status === "passed")).toBe(true);
    expect(result.paymentTransactionReference).toMatch(/^SIM-PAY-\d{4}-/);
    expect(result.steps.find((step) => step.key === "payment")?.summary.toLowerCase()).toContain("simulated");
  });

  test("stops before downstream checks when identity cannot be verified", () => {
    const result = runWorkerClaimDemo({ nid: "NID-00019999" });

    expect(result.status).toBe("stopped");
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]).toMatchObject({
      key: "claim_registration",
      status: "passed",
    });
    expect(result.steps[1]).toMatchObject({ key: "identity", status: "failed" });
    expect(result.paymentTransactionReference).toBeNull();
  });

  test("stops a claim when valid records belong to different workers", () => {
    const result = runWorkerClaimDemo({
      nid: "NID-00010001",
      registrationNo: "IPA-2018-2044",
      tin: "TIN-90010002",
      employeeNo: "EMP-0001002",
      certificateNo: "MED-2026-00452",
      policyNo: "WC-POL-2026-01903",
      accountReference: "BANK-ACC-3921",
    });

    expect(result.status).toBe("stopped");
    expect(result.steps.at(-1)).toMatchObject({
      key: "record_reconciliation",
      status: "failed",
    });
  });

  test("reuses the same payment transaction for a repeated claim run", () => {
    const first = runWorkerClaimDemo();
    const second = runWorkerClaimDemo();

    expect(second.paymentTransactionReference).toBe(first.paymentTransactionReference);
  });
});
