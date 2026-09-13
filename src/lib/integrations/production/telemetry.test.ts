import { describe, expect, test } from "bun:test";
import { projectProductionIntegrationTelemetry } from "./telemetry";
import type { ProductionIntegrationResult } from "./types";

describe("production integration telemetry", () => {
  test("projects metadata only and excludes claimant, medical, payment and credential payloads", () => {
    const result: ProductionIntegrationResult<Record<string, unknown>> = {
      service: "medical",
      operation: "eligibility-check",
      correlationId: "corr-123",
      timestamp: "2026-09-13T12:00:00.000Z",
      status: "upstream-error",
      httpStatus: 502,
      durationMs: 143,
      data: {
        claimantName: "Sensitive Person",
        diagnosis: "Sensitive Diagnosis",
        bankAccount: "000-SECRET",
        apiKey: "never-log-this",
      },
      error: "upstream payload contained sensitive internal detail",
    };

    const telemetry = projectProductionIntegrationTelemetry(result);
    const serialized = JSON.stringify(telemetry);

    expect(telemetry).toEqual({
      service: "medical",
      operation: "eligibility-check",
      correlationId: "corr-123",
      outcome: "upstream-error",
      httpStatus: 502,
      durationMs: 143,
      timestamp: "2026-09-13T12:00:00.000Z",
    });
    expect(serialized).not.toContain("Sensitive Person");
    expect(serialized).not.toContain("Sensitive Diagnosis");
    expect(serialized).not.toContain("000-SECRET");
    expect(serialized).not.toContain("never-log-this");
    expect(serialized).not.toContain("sensitive internal detail");
  });
});
