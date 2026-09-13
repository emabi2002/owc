import { describe, expect, test } from "bun:test";
import { runReferenceUatSuite } from "./reference-suite";

describe("OWC reference UAT suite behavior", () => {
  test("passes all seven required synthetic scenarios", () => {
    const result = runReferenceUatSuite({
      releaseSha: "test-release-sha",
      generatedAt: "2026-09-14T00:00:00.000Z",
    });

    expect(result.mode).toBe("REFERENCE/SANDBOX");
    expect(result.syntheticData).toBe(true);
    expect(result.productionAcceptance).toBe(false);
    expect(result.releaseSha).toBe("test-release-sha");
    expect(result.scenarios).toHaveLength(7);
    expect(result.scenarios.map((scenario) => scenario.id)).toEqual([
      "REF-UAT-001",
      "REF-UAT-002",
      "REF-UAT-003",
      "REF-UAT-004",
      "REF-UAT-005",
      "REF-UAT-006",
      "REF-UAT-007",
    ]);
    expect(result.scenarios.every((scenario) => scenario.status === "passed")).toBe(true);
    expect(result.summary).toEqual({ total: 7, passed: 7, failed: 0, status: "passed" });
  });

  test("happy path preserves all twelve integration steps and correlation evidence", () => {
    const result = runReferenceUatSuite();
    const scenario = result.scenarios.find((item) => item.id === "REF-UAT-001");

    expect(scenario?.checks.map((check) => check.key)).toEqual([
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
    expect(scenario?.checks.every((check) => check.status === "passed")).toBe(true);
    expect(scenario?.checks.every((check) => Boolean(check.correlationId))).toBe(true);
  });

  test("reference CPPS payment evidence never claims real money movement", () => {
    const result = runReferenceUatSuite();
    const scenario = result.scenarios.find((item) => item.id === "REF-UAT-005");

    expect(scenario?.status).toBe("passed");
    expect(scenario?.evidence).toMatchObject({ realFundsMoved: false, finalState: "closed" });
  });

  test("backend-selection evidence distinguishes live, reference and unavailable", () => {
    const result = runReferenceUatSuite();
    const scenario = result.scenarios.find((item) => item.id === "REF-UAT-007");

    expect(scenario?.evidence).toEqual({
      liveConfigured: "live",
      referenceOnly: "reference",
      neitherConfigured: "unavailable",
    });
  });
});
