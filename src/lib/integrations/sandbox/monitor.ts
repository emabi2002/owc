import type { IntegrationEvent } from "./events";
import type { SandboxServiceName, SandboxServiceStatus } from "./types";

export interface SandboxHealthRow {
  service: SandboxServiceName;
  status: SandboxServiceStatus;
}

export interface IntegrationMonitorRow {
  service: SandboxServiceName;
  label: string;
  health: SandboxServiceStatus;
  source: "sandbox";
  lastOperation: string | null;
  operationStatus: IntegrationEvent["status"] | null;
  durationMs: number | null;
  correlationId: string | null;
  timestamp: string | null;
}

const LABELS: Record<SandboxServiceName, string> = {
  nid: "National Identity (NID)",
  ipa: "Employer Registry (IPA)",
  irc: "IRC Tax Compliance",
  employer: "Employer HR / Payroll",
  medical: "Medical Provider",
  insurance: "Insurance Provider",
  bank: "Bank / Payment Service",
  notifications: "Email / SMS Notifications",
};

export function sandboxServiceLabel(service: SandboxServiceName): string {
  return LABELS[service];
}

export function buildMonitorRows(
  health: SandboxHealthRow[],
  events: IntegrationEvent[],
): IntegrationMonitorRow[] {
  return health.map((item) => {
    const latest = events.find((event) => event.service === item.service) ?? null;
    return {
      service: item.service,
      label: sandboxServiceLabel(item.service),
      health: item.status,
      source: "sandbox",
      lastOperation: latest?.operation ?? null,
      operationStatus: latest?.status ?? null,
      durationMs: latest?.durationMs ?? null,
      correlationId: latest?.correlationId ?? null,
      timestamp: latest?.timestamp ?? null,
    };
  });
}
