import type { AiAdapter, AiGatewayRequest } from "./types";

export type OpenAiCompatibleOptions = {
  apiUrl: string;
  apiKey: string;
  model: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  maxResponseCharacters?: number;
};

type ChatCompletionPayload = {
  choices?: Array<{ message?: { content?: unknown } }>;
};

export function createOpenAiCompatibleAdapter(
  options: OpenAiCompatibleOptions,
): AiAdapter {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 12_000;
  const maxResponseCharacters = options.maxResponseCharacters ?? 8_000;

  return {
    async generate(request: AiGatewayRequest) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetcher(options.apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: options.model,
            messages: [
              {
                role: "system",
                content:
                  request.purpose === "management_analysis"
                    ? "You assist OWC management with read-only analysis. Never request or perform operational writes or arbitrary SQL."
                    : "You provide OWC public guidance. Do not disclose private claim data without verified authorization.",
              },
              { role: "user", content: request.prompt },
            ],
            temperature: 0.1,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`AI provider request failed (${response.status})`);
        }

        const payload = (await response.json()) as ChatCompletionPayload;
        const content = payload.choices?.[0]?.message?.content;
        if (typeof content !== "string" || !content.trim()) {
          throw new Error("invalid AI provider response");
        }

        return {
          ok: true,
          text: content.slice(0, maxResponseCharacters),
          source: "live" as const,
          productionConnected: true,
        };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
