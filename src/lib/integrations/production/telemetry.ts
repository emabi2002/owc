import type {
  ProductionIntegrationResult,
  ProductionIntegrationStatus,
  ProductionServiceName,
} from "./types";

export type ProductionIntegrationTelemetry = {
  service: ProductionServiceName;
  operation: string;
  correlationId: string;
  outcome: ProductionIntegrationStatus;
  httpStatus?: number;
  durationMs: number;
  timestamp: string;
};

/**
 * Convert a connector result to its safe operational telemetry projection.
 *
 * Deliberately excludes result data, error bodies, request payloads and all
 * credential material. Callers may persist/log this projection without
 * serialising claimant or upstream response content.
 */
export function projectProductionIntegrationTelemetry<T>(
  result: ProductionIntegrationResult<T>,
): ProductionIntegrationTelemetry {
  return {
    service: result.service,
    operation: result.operation,
    correlationId: result.correlationId,
    outcome: result.status,
    ...(result.httpStatus === undefined ? {} : { httpStatus: result.httpStatus }),
    durationMs: result.durationMs,
    timestamp: result.timestamp,
  };
}
