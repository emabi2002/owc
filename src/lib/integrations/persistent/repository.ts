import type {
  PersistentEnvelope,
  PersistentIntegrationRepository,
  PersistentNotificationInput,
  PersistentPaymentInput,
  PersistentRpcClient,
  PersistentServiceName,
} from "./types";

const UNAVAILABLE_MESSAGE = "Persistent demonstration service unavailable";
const INVALID_RESPONSE_MESSAGE = "Persistent demonstration returned an invalid response";

export class PersistentIntegrationError extends Error {
  readonly status: number;

  constructor(message = UNAVAILABLE_MESSAGE, status = 503) {
    super(message);
    this.name = "PersistentIntegrationError";
    this.status = status;
  }
}

function normalizedCode(value: string): string {
  return value.trim().toUpperCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEnvelope(value: unknown): value is PersistentEnvelope {
  if (!isRecord(value) || !isRecord(value.data)) return false;
  return value.source === "persistent_demo"
    && typeof value.service === "string"
    && typeof value.operation === "string"
    && typeof value.correlationId === "string"
    && typeof value.timestamp === "string";
}

function recordArray(value: unknown): readonly Record<string, unknown>[] | null {
  if (!Array.isArray(value) || !value.every(isRecord)) return null;
  return value;
}

export function createPersistentIntegrationRepository(
  client: PersistentRpcClient,
): PersistentIntegrationRepository {
  async function call(functionName: string, params: Record<string, unknown> = {}) {
    let result;
    try {
      result = await client.rpc(functionName, params);
    } catch {
      throw new PersistentIntegrationError();
    }
    if (result.error) throw new PersistentIntegrationError();
    return result.data;
  }

  async function envelope(functionName: string, params: Record<string, unknown>) {
    const data = await call(functionName, params);
    if (!isEnvelope(data)) {
      throw new PersistentIntegrationError(INVALID_RESPONSE_MESSAGE, 502);
    }
    return data;
  }

  return {
    lookup(service: PersistentServiceName, identifier: string) {
      return envelope("owc_demo_lookup", {
        p_service: service,
        p_identifier: normalizedCode(identifier),
      });
    },

    processPayment(input: PersistentPaymentInput) {
      return envelope("owc_demo_process_payment", {
        p_idempotency_key: input.idempotencyKey.trim(),
        p_claim_reference: normalizedCode(input.claimReference),
        p_account_reference: normalizedCode(input.accountReference),
        p_amount_pgk: input.amountPgk,
      });
    },

    async listEvents(limit = 100) {
      const data = await call("owc_demo_list_events", {
        p_limit: Math.max(1, Math.min(Math.trunc(limit), 500)),
      });
      const records = recordArray(data);
      if (!records) throw new PersistentIntegrationError(INVALID_RESPONSE_MESSAGE, 502);
      return records;
    },

    async listServiceState() {
      const data = await call("owc_demo_list_service_state");
      const records = recordArray(data);
      if (!records) throw new PersistentIntegrationError(INVALID_RESPONSE_MESSAGE, 502);
      return records;
    },

    sendNotification(input: PersistentNotificationInput) {
      return envelope("owc_demo_send_notification", {
        p_channel: input.channel,
        p_recipient: input.recipient.trim(),
        p_event: input.event.trim(),
        p_message: input.message,
        p_claim_reference: input.claimReference
          ? normalizedCode(input.claimReference)
          : null,
      });
    },
  };
}
