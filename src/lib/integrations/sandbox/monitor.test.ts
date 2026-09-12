import { describe, expect, test } from "bun:test";
import { buildMonitorRows, sandboxServiceLabel } from "./monitor";

describe("integration monitor presentation model", () => {
  test("uses evaluator-friendly service labels", () => {
    expect(sandboxServiceLabel("nid")).toBe("National Identity (NID)");
    expect(sandboxServiceLabel("bank")).toBe("Bank / Payment Service");
  });

  test("combines health with the latest event for each service", () => {
    const rows = buildMonitorRows(
      [
        { service: "nid", status: "online" },
        { service: "bank", status: "online" },
      ],
      [
        {
          correlationId: "OWC-DEMO-BANK",
          service: "bank",
          operation: "verify_account",
          status: "success",
          durationMs: 31,
          source: "sandbox",
          timestamp: "2026-09-12T01:00:00.000Z",
        },
      ],
    );

    expect(rows[0]).toMatchObject({ service: "nid", health: "online", lastOperation: null });
    expect(rows[1]).toMatchObject({
      service: "bank",
      health: "online",
      lastOperation: "verify_account",
      durationMs: 31,
      correlationId: "OWC-DEMO-BANK",
    });
  });
});
