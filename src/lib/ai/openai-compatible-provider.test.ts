import { describe, expect, test } from "bun:test";
import { createOpenAiCompatibleAdapter } from "./openai-compatible-provider";

describe("OWC OpenAI-compatible provider adapter", () => {
  test("keeps API credentials in the server Authorization header", async () => {
    let seenUrl = "";
    let seenAuthorization = "";
    let seenBody = "";
    const adapter = createOpenAiCompatibleAdapter({
      apiUrl: "https://ai.example.test/v1/chat/completions",
      apiKey: "server-only-secret",
      model: "owc-model",
      fetcher: async (input, init) => {
        seenUrl = String(input);
        seenAuthorization = String((init?.headers as Record<string, string>)?.Authorization ?? "");
        seenBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({ choices: [{ message: { content: "Authoritative explanation" } }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    });

    const result = await adapter.generate({
      purpose: "management_analysis",
      prompt: "Summarise the report",
    });

    expect(seenUrl).toBe("https://ai.example.test/v1/chat/completions");
    expect(seenAuthorization).toBe("Bearer server-only-secret");
    expect(seenBody).not.toContain("server-only-secret");
    expect(result.ok).toBe(true);
    expect(result.source).toBe("live");
    expect(result.productionConnected).toBe(true);
    expect(result.text).toBe("Authoritative explanation");
    expect(JSON.stringify(result)).not.toContain("server-only-secret");
  });

  test("rejects provider failures instead of fabricating reference success", async () => {
    const adapter = createOpenAiCompatibleAdapter({
      apiUrl: "https://ai.example.test/v1/chat/completions",
      apiKey: "server-only-secret",
      model: "owc-model",
      fetcher: async () => new Response("bad gateway", { status: 502 }),
    });

    await expect(
      adapter.generate({ purpose: "management_analysis", prompt: "Total claims" }),
    ).rejects.toThrow("AI provider request failed");
  });

  test("rejects malformed success payloads and caps returned text", async () => {
    const malformed = createOpenAiCompatibleAdapter({
      apiUrl: "https://ai.example.test/v1/chat/completions",
      apiKey: "server-only-secret",
      model: "owc-model",
      fetcher: async () => new Response(JSON.stringify({ choices: [] }), { status: 200 }),
    });
    await expect(
      malformed.generate({ purpose: "management_analysis", prompt: "Total claims" }),
    ).rejects.toThrow("invalid AI provider response");

    const longText = "x".repeat(20000);
    const bounded = createOpenAiCompatibleAdapter({
      apiUrl: "https://ai.example.test/v1/chat/completions",
      apiKey: "server-only-secret",
      model: "owc-model",
      maxResponseCharacters: 4000,
      fetcher: async () => new Response(
        JSON.stringify({ choices: [{ message: { content: longText } }] }),
        { status: 200 },
      ),
    });
    const result = await bounded.generate({
      purpose: "public_assistance",
      prompt: "Explain the process",
    });
    expect(result.text?.length).toBe(4000);
  });
});
