import { serverEnv } from "../../env";
import type {
  ProductionConnectorConfig,
  ProductionConnectorReadiness,
  ProductionServiceName,
} from "./types";

/**
 * Approved external-service boundary for the production OWC Integration Hub.
 *
 * These names are intentionally generic. The registry does not encode or infer
 * any external-agency request/response schema; those contracts remain unknown
 * until the relevant agency supplies an approved interface specification.
 */
export const PRODUCTION_SERVICES = [
  "nid",
  "employerRegistry",
  "insurance",
  "payments",
  "medical",
] as const satisfies readonly ProductionServiceName[];

/**
 * Return server-side connector configuration for one approved service.
 * Credentials are sourced only from serverEnv and must never be projected to
 * browser/mobile clients or readiness responses.
 */
export function getProductionConnectorConfig(
  service: ProductionServiceName,
): ProductionConnectorConfig {
  switch (service) {
    case "nid":
      return {
        service,
        baseUrl: serverEnv.nidApiBaseUrl.trim(),
        apiKey: serverEnv.nidApiKey,
      };
    case "employerRegistry":
      return {
        service,
        baseUrl: serverEnv.employerRegistryApiBaseUrl.trim(),
        apiKey: serverEnv.employerRegistryApiKey,
      };
    case "insurance":
      return {
        service,
        baseUrl: serverEnv.insuranceApiBaseUrl.trim(),
        apiKey: serverEnv.insuranceApiKey,
      };
    case "payments":
      return {
        service,
        baseUrl: serverEnv.paymentApiBaseUrl.trim(),
        apiKey: serverEnv.paymentApiKey,
      };
    case "medical":
      return {
        service,
        baseUrl: serverEnv.medicalApiBaseUrl.trim(),
        apiKey: serverEnv.medicalApiKey,
      };
  }
}

/**
 * Build a credential-safe configuration readiness view.
 *
 * A configured base URL means the connector may proceed to transport-level
 * validation. It does not mean that connectivity, credentials, agency schemas
 * or production acceptance have been verified.
 */
export function buildProductionConnectorReadiness(
  configs: readonly ProductionConnectorConfig[],
): ProductionConnectorReadiness[] {
  return configs.map((config) => {
    const configured = Boolean(config.baseUrl.trim());

    return {
      service: config.service,
      status: configured ? "configured" : "configuration-required",
      detail: configured
        ? "Endpoint configured; live connectivity and agency contract remain unverified."
        : "External agency endpoint is not configured.",
    };
  });
}
