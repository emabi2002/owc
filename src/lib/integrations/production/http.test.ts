import { describe, expect, test } from "bun:test";
import { callProductionConnector } from "./http";
import type { ProductionConnectorConfig } from "./types";

const configured: ProductionConnectorConfig = {
  service: "nid",
  baseUrl: "https://nid.example.gov.pg/api/",
  apiKey: "top-secret-key",
};

describe("production connector HTTP transport", () => {
  test("does not call fetch when the connector is unconfigured", async () => {
    let calls = 0;
    const result = await callProductionConnector(
      { ...configured, baseUrl: "" },
      "health",
      {
        path: "health",
        fetchImpl: async () => {
          calls += 1;
          return new Response("{}");
        },
      },
    );

    expect(calls).toBe(0);
    expect(result.status).toBe("configuration-required");
  });

  test("rejects insecure non-local HTTP endpoints without calling fetch", async () => {
    let calls = 0;
    const result = await callProductionConnector(
      { ...configured, baseUrl: "http://nid.example.gov.pg" },
      "health",
      {
        path: "/health",
        fetchImpl: async () => {
          calls += 1;
          return new Response("{}");
        },
      },
    );

    expect(calls).toBe(0);
    expect(result.status).toBe("invalid-configuration");
  });

  test("keeps bearer credentials in request headers and normalizes 2xx JSON", async () => {
    let seenUrl = "";
    let seenAuthorization = "";

    const result = await callProductionConnector<{ ok: boolean }>(configured, "lookup", {
      path: "lookup",
      method: "POST",
      body: { reference: "UAT-REFERENCE" },
      fetchImpl: async (input, init) => {
        seenUrl = String(input);
        const headers = new Headers(init?.headers);
        seenAuthorization = headers.get("authorization") ?? "";
        return Response.json({ ok: true }, { status: 200 });
      },
    });

    expect(seenUrl).toBe("https://nid.example.gov.pg/api/lookup");
    expect(seenUrl).not.toContain("top-secret-key");
    expect(seenAuthorization).toBe("Bearer top-secret-key");
    expect(result.status).toBe("success");
    expect(result.data).toEqual({ ok: true });
    expect(result.correlationId.length).toBeGreaterThan(10);
  });

  test("isolates upstream failures without echoing upstream payloads", async () => {
    const result = await callProductionConnector(configured, "lookup", {
      path: "lookup",
      fetchImpl: async () =>
        new Response(JSON.stringify({ secret: "claimant-medical-detail" }), {
          status: 503,
          headers: { "content-type": "application/json" },
        }),
    });

    expect(result.status).toBe("upstream-error");
    expect(result.httpStatus).toBe(503);
    expect(JSON.stringify(result)).not.toContain("claimant-medical-detail");
  });

  test("isolates network failures", async () => {
    const result = await callProductionConnector(configured, "lookup", {
      path: "lookup",
      fetchImpl: async () => {
        throw new Error("socket failure with internal details");
      },
    });

    expect(result.status).toBe("unavailable");
    expect(result.error).toBe("External service is unavailable.");
    expect(JSON.stringify(result)).not.toContain("internal details");
  });
});
