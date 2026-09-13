import { recordIntegrationEvent, type IntegrationEventStatus } from "./events";
import type { SandboxEnvelope, SandboxServiceName } from "./types";

export function makeCorrelationId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `OWC-DEMO-${time}-${random}`;
}

export function makeSandboxEnvelope<T>(
  service: SandboxServiceName,
  operation: string,
  data: T,
  status: IntegrationEventStatus = "success",
  startedAt = Date.now(),
): SandboxEnvelope<T> {
  const correlationId = makeCorrelationId();
  const timestamp = new Date().toISOString();

  recordIntegrationEvent({
    correlationId,
    service,
    operation,
    status,
    durationMs: Math.max(0, Date.now() - startedAt),
    source: "sandbox",
  });

  return {
    source: "sandbox",
    service,
    operation,
    correlationId,
    timestamp,
    data,
  };
}
