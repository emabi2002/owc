import { describe, expect, test } from "bun:test";
import { buildHealthSummary } from "./health";

describe("OWC service health summary", () => {
  test("reports healthy when the application is serving", () => {
    const health = buildHealthSummary("2026-09-12T00:00:00.000Z");
    expect(health.status).toBe("ok");
    expect(health.service).toBe("owc-portal");
    expect(health.timestamp).toBe("2026-09-12T00:00:00.000Z");
  });
});
