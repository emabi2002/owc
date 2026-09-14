import { describe, expect, test } from "bun:test";
import { createReferenceAiAdapter } from "./reference-provider";

const request = {
  purpose: "management_analysis" as const,
  prompt: "Show claims by province",
};

describe("OWC reference AI provider", () => {
  test("is deterministic, synthetic and never production-connected", async () => {
    const adapter = createReferenceAiAdapter();
    const first = await adapter.generate(request);
    const second = await adapter.generate(request);

    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    expect(first.source).toBe("reference");
    expect(first.productionConnected).toBe(false);
    expect(first.text).toBeTruthy();
  });

  test("does not need or call an external fetch implementation", async () => {
    let calls = 0;
    const adapter = createReferenceAiAdapter({
      fetcher: async () => {
        calls += 1;
        throw new Error("network must not be used");
      },
    });
    const result = await adapter.generate({
      purpose: "public_assistance",
      prompt: "How do I lodge a claim?",
    });

    expect(result.ok).toBe(true);
    expect(calls).toBe(0);
  });
});
