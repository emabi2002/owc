import { describe, expect, test } from "bun:test";
import { runDemonstrationUatSuite } from "./demonstration-suite";

const REQUIRED_SCENARIOS = [
  "DEMO-UAT-001",
  "DEMO-UAT-002",
  "DEMO-UAT-003",
  "DEMO-UAT-004",
  "DEMO-UAT-005",
  "DEMO-UAT-006",
  "DEMO-UAT-007",
] as const;

describe("OWC presentation-level demonstration UAT", () => {
  test("passes the seven required synthetic presentation scenarios", async () => {
    const result = await runDemonstrationUatSuite({
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      generatedAt: "2026-09-14T00:00:00.000Z",
    });

    expect(result.suite).toBe("OWC_DEMONSTRATION_END_TO_END_UAT");
    expect(result.environment).toBe("DEMONSTRATION");
    expect(result.syntheticData).toBe(true);
    expect(result.demonstrationAcceptance).toBe(true);
    expect(result.productionAcceptance).toBe(false);
    expect(result.releaseSha).toBe("0123456789abcdef0123456789abcdef01234567");
    expect(result.scenarios.map((scenario) => scenario.id)).toEqual(REQUIRED_SCENARIOS);
    expect(result.summary).toEqual({ total: 7, passed: 7, failed: 0, status: "passed" });
  });

  test("covers happy path, missing documents, identity mismatch, infected evidence, declined claim, payment idempotency and outage recovery", async () => {
    const result = await runDemonstrationUatSuite();
    const titles = result.scenarios.map((scenario) => scenario.title.toLowerCase()).join("\n");
    for (const phrase of [
      "successful claim",
      "missing documents",
      "identity mismatch",
      "infected evidence",
      "declined claim",
      "payment idempotency",
      "outage and recovery",
    ]) {
      expect(titles).toContain(phrase);
    }
    expect(result.scenarios.every((scenario) => scenario.status === "passed")).toBe(true);
  });

  test("payment evidence can never be interpreted as financial settlement", async () => {
    const result = await runDemonstrationUatSuite();
    const payment = result.scenarios.find((scenario) => scenario.id === "DEMO-UAT-006");
    expect(payment?.evidence.simulation).toBe(true);
    expect(payment?.evidence.moneyMovement).toBe(false);
    expect(String(payment?.evidence.transactionReference)).toStartWith("SIM-PAY-");
  });

  test("infected evidence is detected using the harmless deterministic reference marker", async () => {
    const result = await runDemonstrationUatSuite();
    const infected = result.scenarios.find((scenario) => scenario.id === "DEMO-UAT-004");
    expect(infected?.evidence.scanStatus).toBe("infected");
    expect(infected?.evidence.productionConnected).toBe(false);
  });

  test("provides a release-linked evidence runner and demonstration-only documentation", async () => {
    expect(await Bun.file("scripts/uat/run-demonstration-suite.ts").exists()).toBe(true);
    expect(await Bun.file("docs/verification/demonstration-uat.md").exists()).toBe(true);
    const pkg = JSON.parse(await Bun.file("package.json").text()) as { scripts: Record<string, string> };
    expect(pkg.scripts["uat:demonstration"]).toBe("bun scripts/uat/run-demonstration-suite.ts");
    const docs = await Bun.file("docs/verification/demonstration-uat.md").text();
    expect(docs).toContain("demonstrationAcceptance=true");
    expect(docs).toContain("productionAcceptance=false");
    expect(docs).toContain("No real funds");
  });
});
