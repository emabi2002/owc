export type AiProvider = "disabled" | "reference" | "openai_compatible";
export type AiPurpose = "management_analysis" | "public_assistance";

export type AiGatewayRequest = {
  purpose: AiPurpose;
  prompt: string;
};

export type AiAdapterResult = {
  ok: boolean;
  text?: string;
  error?: string;
  source: "reference" | "live";
  productionConnected: boolean;
};

export type AiAdapter = {
  generate: (request: AiGatewayRequest) => Promise<AiAdapterResult>;
};

export type AiGatewayResult = AiAdapterResult & {
  provider: AiProvider;
};

export type AiGatewayConfiguration = {
  provider: AiProvider;
  apiUrl?: string;
  apiKey?: string;
  model?: string;
};

export type AiGatewayHealth = {
  provider: AiProvider;
  configured: boolean;
  modelConfigured: boolean;
  endpointConfigured: boolean;
};
