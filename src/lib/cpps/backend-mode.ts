export type CppsBackendMode = "live" | "reference" | "unavailable";

export type CppsBackendSelection = {
  liveConfigured: boolean;
  referenceEnabled: boolean;
};

/**
 * Select the CPPS implementation without ever silently treating synthetic data
 * as production data. A configured live CPPS always wins. Reference mode must
 * be explicitly enabled; otherwise CPPS-dependent operations fail closed.
 */
export function selectCppsBackend({
  liveConfigured,
  referenceEnabled,
}: CppsBackendSelection): CppsBackendMode {
  if (liveConfigured) return "live";
  if (referenceEnabled) return "reference";
  return "unavailable";
}
