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
): SandboxEnvelope<T> {
  return {
    source: "sandbox",
    service,
    operation,
    correlationId: makeCorrelationId(),
    timestamp: new Date().toISOString(),
    data,
  };
}
