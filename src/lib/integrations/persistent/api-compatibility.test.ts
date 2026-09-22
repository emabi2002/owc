import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { createIntegrationGateway } from "./gateway";
import type { PersistentIntegrationRepository } from "./types";

const persistentResponse = {
  source: "persistent_demo" as const,
  service: "nid" as const,
  operation: "verify_identity",
  correlationId: "OWC-DEMO-PERSISTENT",
  timestamp: "2026-09-22T00:00:00.000Z",
  data: { matched: true },
};

function repository(): PersistentIntegrationRepository {
  return {
    lookup: async () => persistentResponse,
    processPayment: async () => persistentResponse,
    listEvents: async () => [],
    listServiceState: async () => [],
    sendNotification: async () => persistentResponse,
  };
}

describe("persistent API compatibility", () => {
  test("selects the persistent repository when persistent mode is enabled", async () => {
    let fallbackCalls = 0;
    const gateway = createIntegrationGateway({
      persistentMode: true,
      repository: repository(),
      fallback: {
        verifyIdentity: () => { fallbackCalls += 1; return { fallback: true }; },
      },
    });

    expect(await gateway.verifyIdentity("nid-00010001")).toEqual(persistentResponse);
    expect(fallbackCalls).toBe(0);
  });

  test("fails closed when persistent mode lacks its server repository", async () => {
    let fallbackCalls = 0;
    const gateway = createIntegrationGateway({
      persistentMode: true,
      repository: null,
      fallback: {
        verifyIdentity: () => { fallbackCalls += 1; return { fallback: true }; },
      },
    });

    expect(gateway.verifyIdentity("NID-00010001"))
      .rejects.toThrow("Persistent demonstration service unavailable");
    expect(fallbackCalls).toBe(0);
  });

  test("keeps static demonstration behavior only when persistent mode is disabled", async () => {
    const gateway = createIntegrationGateway({
      persistentMode: false,
      repository: null,
      fallback: { verifyIdentity: () => ({ source: "sandbox", data: { matched: true } }) },
    });
    expect(await gateway.verifyIdentity("NID-00010001"))
      .toEqual({ source: "sandbox", data: { matched: true } });
  });

  test("all verification routes use the gateway and retain shared validation handling", async () => {
    const root = join(process.cwd(), "src/app/api/integrations");
    const routeFiles: string[] = [];
    async function walk(path: string) {
      for (const entry of await readdir(path, { withFileTypes: true })) {
        const file = join(path, entry.name);
        if (entry.isDirectory()) await walk(file);
        else if (entry.name === "route.ts" && !file.endsWith("/events/route.ts")
          && !file.endsWith("/health/route.ts") && !file.endsWith("/claim/process/route.ts")) routeFiles.push(file);
      }
    }
    await walk(root);
    expect(routeFiles.length).toBe(9);
    for (const file of routeFiles) {
      const source = await Bun.file(file).text();
      expect(source).toContain("@/lib/integrations/persistent/gateway");
      expect(source).toContain("handleSandboxPost");
      expect(source).not.toContain("sandbox/agencies");
    }

    const handler = await Bun.file("src/lib/integrations/sandbox/http.ts").text();
    expect(handler).toContain("await options.execute");
    expect(handler).toContain("PersistentIntegrationError");
  });
});
