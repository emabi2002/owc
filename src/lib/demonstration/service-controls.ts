import {
  getSandboxServiceStatus,
  listSandboxServiceStatuses,
  setSandboxServiceStatus,
} from "@/lib/integrations/sandbox/state";
import type {
  SandboxServiceName,
  SandboxServiceStatus,
} from "@/lib/integrations/sandbox/types";

export type DemonstrationServiceControlConfiguration = {
  identityMode?: string;
  resetEnabled?: string;
};

export const DEMONSTRATION_SERVICES: readonly SandboxServiceName[] = [
  "cpps",
  "nid",
  "ipa",
  "irc",
  "employer",
  "medical",
  "insurance",
  "bank",
  "notifications",
] as const;

export const DEMONSTRATION_SERVICE_STATUSES: readonly SandboxServiceStatus[] = [
  "online",
  "degraded",
  "offline",
] as const;

function resolvedConfiguration(
  configuration?: DemonstrationServiceControlConfiguration,
): Required<DemonstrationServiceControlConfiguration> {
  return {
    identityMode: configuration?.identityMode ?? process.env.OWC_IDENTITY_MODE ?? "",
    resetEnabled: configuration?.resetEnabled ?? process.env.OWC_ENABLE_DEMO_RESET ?? "",
  };
}

export function isDemonstrationServiceControlEnabled(
  configuration?: DemonstrationServiceControlConfiguration,
): boolean {
  const resolved = resolvedConfiguration(configuration);
  return resolved.identityMode === "demonstration" && resolved.resetEnabled === "true";
}

export function isDemonstrationServiceName(value: string): value is SandboxServiceName {
  return DEMONSTRATION_SERVICES.includes(value as SandboxServiceName);
}

export function isDemonstrationServiceStatus(value: string): value is SandboxServiceStatus {
  return DEMONSTRATION_SERVICE_STATUSES.includes(value as SandboxServiceStatus);
}

export function listDemonstrationServiceStatuses() {
  return {
    environment: "DEMONSTRATION" as const,
    synthetic: true as const,
    productionConnected: false as const,
    services: listSandboxServiceStatuses(),
  };
}

export function setDemonstrationServiceStatus(
  service: SandboxServiceName,
  status: SandboxServiceStatus,
  configuration?: DemonstrationServiceControlConfiguration,
) {
  if (!isDemonstrationServiceControlEnabled(configuration)) {
    throw new Error("demonstration service controls are disabled");
  }
  setSandboxServiceStatus(service, status);
  return {
    environment: "DEMONSTRATION" as const,
    service,
    status: getSandboxServiceStatus(service),
    synthetic: true as const,
    productionConnected: false as const,
  };
}
