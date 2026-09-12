import type { SandboxServiceName, SandboxServiceStatus } from "./types";

const SERVICES: SandboxServiceName[] = [
  "nid",
  "ipa",
  "irc",
  "employer",
  "medical",
  "insurance",
  "bank",
  "notifications",
];

const serviceStatus = new Map<SandboxServiceName, SandboxServiceStatus>();

export function resetSandboxServiceStatuses(): void {
  serviceStatus.clear();
  for (const service of SERVICES) serviceStatus.set(service, "online");
}

resetSandboxServiceStatuses();

export function getSandboxServiceStatus(
  service: SandboxServiceName,
): SandboxServiceStatus {
  return serviceStatus.get(service) ?? "online";
}

export function setSandboxServiceStatus(
  service: SandboxServiceName,
  status: SandboxServiceStatus,
): void {
  serviceStatus.set(service, status);
}

export function listSandboxServiceStatuses() {
  return SERVICES.map((service) => ({
    service,
    status: getSandboxServiceStatus(service),
  }));
}
