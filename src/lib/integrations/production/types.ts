export type ProductionServiceName =
  | "nid"
  | "employerRegistry"
  | "insurance"
  | "payments"
  | "medical";

export type ProductionConnectorConfig = {
  service: ProductionServiceName;
  baseUrl: string;
  apiKey: string;
};

export type ProductionConnectorReadiness = {
  service: ProductionServiceName;
  status: "configured" | "configuration-required";
  detail: string;
};

export type ProductionIntegrationStatus =
  | "success"
  | "configuration-required"
  | "invalid-configuration"
  | "upstream-error"
  | "unavailable";

export type ProductionIntegrationResult<T> = {
  service: ProductionServiceName;
  operation: string;
  correlationId: string;
  timestamp: string;
  status: ProductionIntegrationStatus;
  data?: T;
  error?: string;
  httpStatus?: number;
  durationMs: number;
};
