import { serverEnv } from "@/lib/env";
import type {
  AiAdapter,
  AiGatewayConfiguration,
  AiGatewayHealth,
  AiGatewayRequest,
  AiGatewayResult,
  AiProvider,
} from "./types";

function configuredProvider(): AiProvider {
  const value = serverEnv.aiProvider;
  if (value === "reference" || value === "openai_compatible") return value;
  return "disabled";
}

function currentConfiguration(): AiGatewayConfiguration {
  return {
    provider: configuredProvider(),
    apiUrl: serverEnv.aiApiUrl,
    apiKey: serverEnv.aiApiKey,
    model: serverEnv.aiModel,
  };
}

export function getAiGatewayHealth(
  configuration: AiGatewayConfiguration = currentConfiguration(),
): AiGatewayHealth {
  const endpointConfigured = Boolean(configuration.apiUrl);
  const modelConfigured = Boolean(configuration.model);
  const configured =
    configuration.provider === "reference" ||
    (configuration.provider === "openai_compatible" &&
      endpointConfigured &&
      modelConfigured &&
      Boolean(configuration.apiKey));

  return {
    provider: configuration.provider,
    configured,
    modelConfigured,
    endpointConfigured,
  };
}

export async function generateAiResponse(
  request: AiGatewayRequest,
  options: {
    provider?: AiProvider;
    adapter?: AiAdapter;
  } = {},
): Promise<AiGatewayResult> {
  const provider = options.provider ?? configuredProvider();

  if (provider === "disabled") {
    return {
      ok: false,
      provider,
      source: "live",
      productionConnected: false,
      error: "OWC AI service is disabled.",
    };
  }

  if (!options.adapter) {
    return {
      ok: false,
      provider,
      source: provider === "reference" ? "reference" : "live",
      productionConnected: false,
      error: "OWC AI provider is unavailable.",
    };
  }

  try {
    const result = await options.adapter.generate(request);
    return { ...result, provider };
  } catch {
    return {
      ok: false,
      provider,
      source: provider === "reference" ? "reference" : "live",
      productionConnected: false,
      error: "OWC AI provider is unavailable.",
    };
  }
}
