import { describe, expect, test } from "bun:test";
import { generateAiResponse, getAiGatewayHealth } from "./gateway";
import type { AiAdapter } from "./types";

const referenceAdapter: AiAdapter = {
  generate: async ({ prompt }) => ({
    ok: true,
    text: `reference:${prompt}`,
    source: "reference",
    productionConnected: false,
  }),
};

describe("OWC provider-neutral AI gateway", () => {
  test("disabled provider fails closed without invoking an adapter", async () => {
    let calls = 0;
    const result = await generateAiResponse(
      { purpose: "management_analysis", prompt: "claims by province" },
      {
        provider: "disabled",
        adapter: { generate: async () => { calls += 1; throw new Error("must not run"); } },
      },
    );

    expect(result.ok).toBe(false);
    expect(result.provider).toBe("disabled");
    expect(result.error).toContain("disabled");
    expect(calls).toBe(0);
  });

  test("reference provider is explicit and remains labelled non-production", async () => {
    const result = await generateAiResponse(
      { purpose: "public_assistance", prompt: "How do I lodge a claim?" },
      { provider: "reference", adapter: referenceAdapter },
    );

    expect(result.ok).toBe(true);
    expect(result.provider).toBe("reference");
    expect(result.source).toBe("reference");
    expect(result.productionConnected).toBe(false);
    expect(result.text).toContain("How do I lodge a claim?");
  });

  test("health metadata never contains API credentials", () => {
    const health = getAiGatewayHealth({
      provider: "openai_compatible",
      apiUrl: "https://ai.example.test/v1/chat/completions",
      apiKey: "super-secret-key",
      model: "owc-demo-model",
    });

    expect(health.provider).toBe("openai_compatible");
    expect(health.configured).toBe(true);
    expect(JSON.stringify(health)).not.toContain("super-secret-key");
  });

  test("an adapter error surfaces as unavailable and never becomes reference success", async () => {
    const result = await generateAiResponse(
      { purpose: "management_analysis", prompt: "total claims" },
      {
        provider: "openai_compatible",
        adapter: { generate: async () => { throw new Error("upstream unavailable"); } },
      },
    );

    expect(result.ok).toBe(false);
    expect(result.provider).toBe("openai_compatible");
    expect(result.source).not.toBe("reference");
    expect(result.error).toContain("unavailable");
  });
});
