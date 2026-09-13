import { describe, expect, test } from "bun:test";

async function read(path: string) {
  return Bun.file(path).text();
}

describe("OWC reference notification gateway contract", () => {
  test("is disabled by default and explicitly synthetic", async () => {
    expect(await Bun.file("src/lib/claims/reference-notification-gateway.ts").exists()).toBe(true);
    const env = await read(".env.example");
    expect(env).toContain('OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY="false"');
    const source = await read("src/lib/claims/reference-notification-gateway.ts");
    expect(source).toContain('source: "reference"');
    expect(source).toContain("productionConnected: false");
  });

  test("keeps a configured live gateway authoritative", async () => {
    const source = await read("src/lib/claims/notification-delivery.ts");
    expect(source).toContain("OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY");
    expect(source).toContain("deliverReferenceClaimNotification");
    expect(source).toContain("if (serverEnv.notificationApiUrl)");
  });

  test("never makes a network request from the synthetic gateway", async () => {
    const source = await read("src/lib/claims/reference-notification-gateway.ts");
    expect(source).not.toContain("fetch(");
    expect(source).toContain("deterministic");
  });

  test("documents the demonstration boundary and post-award live replacement", async () => {
    expect(await Bun.file("docs/operations/reference-notification-gateway.md").exists()).toBe(true);
    const doc = await read("docs/operations/reference-notification-gateway.md");
    expect(doc).toContain("demonstration");
    expect(doc).toContain("synthetic");
    expect(doc).toContain("live notification gateway");
    expect(doc).toContain("post-award");
  });
});
