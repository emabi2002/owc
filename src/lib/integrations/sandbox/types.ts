export type SandboxServiceName =
  | "cpps"
  | "nid"
  | "ipa"
  | "irc"
  | "employer"
  | "medical"
  | "insurance"
  | "bank"
  | "notifications";

export type SandboxServiceStatus = "online" | "offline" | "degraded";

export interface SandboxEnvelope<T> {
  source: "sandbox";
  service: SandboxServiceName;
  operation: string;
  correlationId: string;
  timestamp: string;
  data: T;
}
