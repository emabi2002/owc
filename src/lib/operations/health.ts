export type ApplicationHealth = {
  status: "ok";
  service: "owc-portal";
  timestamp: string;
};

export function buildHealthSummary(
  timestamp = new Date().toISOString(),
): ApplicationHealth {
  return {
    status: "ok",
    service: "owc-portal",
    timestamp,
  };
}
