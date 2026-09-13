import { describe, expect, test } from "bun:test";
import {
  PRODUCTION_SERVICES,
  buildProductionConnectorReadiness,
} from "./registry";

describe("production integration connector registry", () => {
  test("defines the approved external service boundary", () => {
    expect(PRODUCTION_SERVICES).toEqual([
      "nid",
      "employerRegistry",
      "insurance",
      "payments",
      "medical",
    ]);
  });

  test("marks missing connector endpoints as configuration-required", () => {
    const readiness = buildProductionConnectorReadiness([
      { service: "nid", baseUrl: "", apiKey: "" },
      { service: "employerRegistry", baseUrl: "https://registry.example.gov.pg", apiKey: "secret" },
      { service: "insurance", baseUrl: "", apiKey: "" },
      { service: "payments", baseUrl: "", apiKey: "" },
      { service: "medical", baseUrl: "", apiKey: "" },
    ]);

    expect(readiness.find((item) => item.service === "employerRegistry")?.status).toBe("configured");
    expect(readiness.filter((item) => item.status === "configuration-required").map((item) => item.service)).toEqual([
      "nid",
      "insurance",
      "payments",
      "medical",
    ]);
  });
});
