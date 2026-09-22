export type PersistentServiceName =
  | "nid"
  | "ipa"
  | "irc"
  | "employer"
  | "medical"
  | "insurance"
  | "bank"
  | "notifications";

export interface PersistentEnvelope<T = Record<string, unknown>> {
  source: "persistent_demo";
  service: PersistentServiceName;
  operation: string;
  correlationId: string;
  timestamp: string;
  data: T;
}

export interface RpcError {
  message?: string;
  code?: string;
}

export interface RpcResult<T = unknown> {
  data: T | null;
  error: RpcError | null;
}

/** Minimal interface used by the repository so behavior can be tested in isolation. */
export interface PersistentRpcClient {
  rpc(
    functionName: string,
    params?: Record<string, unknown>,
  ): PromiseLike<RpcResult>;
}

export interface PersistentPaymentInput {
  idempotencyKey: string;
  claimReference: string;
  accountReference: string;
  amountPgk: number;
}

export interface PersistentNotificationInput {
  channel: "email" | "sms" | "in_app";
  recipient: string;
  event: string;
  message: string;
  claimReference?: string;
}

export interface PersistentIntegrationRepository {
  lookup(service: PersistentServiceName, identifier: string): Promise<PersistentEnvelope>;
  processPayment(input: PersistentPaymentInput): Promise<PersistentEnvelope>;
  listEvents(limit?: number): Promise<readonly Record<string, unknown>[]>;
  listServiceState(): Promise<readonly Record<string, unknown>[]>;
  sendNotification(input: PersistentNotificationInput): Promise<PersistentEnvelope>;
}
