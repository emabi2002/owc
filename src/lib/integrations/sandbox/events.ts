import type { SandboxServiceName } from "./types";

export type IntegrationEventStatus = "success" | "not_found" | "error" | "unavailable";

export interface IntegrationEvent {
  correlationId: string;
  service: SandboxServiceName;
  operation: string;
  status: IntegrationEventStatus;
  durationMs: number;
  source: "sandbox";
  timestamp: string;
}

type NewIntegrationEvent = Omit<IntegrationEvent, "timestamp">;

const MAX_EVENTS = 100;
const events: IntegrationEvent[] = [];

export function recordIntegrationEvent(event: NewIntegrationEvent): IntegrationEvent {
  const recorded: IntegrationEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  events.unshift(recorded);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  return recorded;
}

export function listIntegrationEvents(): IntegrationEvent[] {
  return events.map((event) => ({ ...event }));
}

export function clearIntegrationEvents(): void {
  events.length = 0;
}
