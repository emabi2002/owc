import type { AiAdapter, AiGatewayRequest } from "./types";

export function createReferenceAiAdapter(
  _options: { fetcher?: typeof fetch } = {},
): AiAdapter {
  return {
    async generate(request: AiGatewayRequest) {
      const text =
        request.purpose === "management_analysis"
          ? `REFERENCE DEMONSTRATION: Interpret the management request through approved reporting tools only: ${request.prompt.trim()}`
          : `REFERENCE DEMONSTRATION: Provide OWC procedural guidance and, where needed, prepare a confirmed enquiry referral: ${request.prompt.trim()}`;

      return {
        ok: true,
        text,
        source: "reference" as const,
        productionConnected: false,
      };
    },
  };
}
