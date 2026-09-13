import { describe, expect, test } from "bun:test";
import {
  clearIntegrationEvents,
  listIntegrationEvents,
  recordIntegrationEvent,
} from "./events";

describe("sandbox integration event store", () => {
  test("records only safe trace metadata in newest-first order", () => {
    clearIntegrationEvents();
    recordIntegrationEvent({
      correlationId: "OWC-DEMO-ONE",
      service: "nid",
      operation: "verify_identity",
      status: "success",
      durationMs: 42,
      source: "sandbox",
    });
    recordIntegrationEvent({
      correlationId: "OWC-DEMO-TWO",
      service: "ipa",
      operation: "verify_company",
      status: "not_found",
      durationMs: 17,
      source: "sandbox",
    });

    const events = listIntegrationEvents();
    expect(events).toHaveLength(2);
    expect(events[0].correlationId).toBe("OWC-DEMO-TWO");
    expect(events[0]).not.toHaveProperty("payload");
    expect(Number.isNaN(Date.parse(events[0].timestamp))).toBe(false);
  });

  test("bounds retained demo telemetry", () => {
    clearIntegrationEvents();
    for (let i = 0; i < 120; i += 1) {
      recordIntegrationEvent({
        correlationId: `OWC-DEMO-${i}`,
        service: "bank",
        operation: "verify_account",
        status: "success",
        durationMs: i,
        source: "sandbox",
      });
    }

    expect(listIntegrationEvents()).toHaveLength(100);
    expect(listIntegrationEvents()[0].correlationId).toBe("OWC-DEMO-119");
  });
});
