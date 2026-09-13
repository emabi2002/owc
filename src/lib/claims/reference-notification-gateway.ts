import { createHash } from "node:crypto";
import type {
  NotificationDeliveryRequest,
  NotificationDeliveryResult,
} from "./notification-delivery";

export type ReferenceNotificationDelivery = NotificationDeliveryRequest & {
  providerMessageId: string;
  source: "reference";
  productionConnected: false;
  deterministic: true;
};

export type ReferenceNotificationDeliveryResult = NotificationDeliveryResult & {
  source: "reference";
  productionConnected: false;
  deterministic: true;
};

const deliveries = new Map<string, ReferenceNotificationDelivery>();

export function isReferenceNotificationGatewayEnabled(value?: string): boolean {
  return value === "true";
}

function deterministicMessageId(input: NotificationDeliveryRequest): string {
  const digest = createHash("sha256")
    .update(
      [
        input.channel,
        input.recipient,
        input.subject,
        input.message,
        input.claimReference,
        input.event,
      ].join("\u001f"),
    )
    .digest("hex")
    .slice(0, 20);
  return `REF-NOTIFY-${digest}`;
}

/**
 * Process-local synthetic delivery for controlled OWC demonstrations.
 * No provider connection is made and no real message is transmitted.
 */
export async function deliverReferenceClaimNotification(
  input: NotificationDeliveryRequest,
): Promise<ReferenceNotificationDeliveryResult> {
  const providerMessageId = deterministicMessageId(input);
  if (!deliveries.has(providerMessageId)) {
    deliveries.set(providerMessageId, {
      ...input,
      providerMessageId,
      source: "reference",
      productionConnected: false,
      deterministic: true,
    });
  }

  return {
    status: "sent",
    providerMessageId,
    source: "reference",
    productionConnected: false,
    deterministic: true,
  };
}

export function listReferenceNotificationDeliveries(): readonly ReferenceNotificationDelivery[] {
  return [...deliveries.values()];
}

export function resetReferenceNotificationDeliveries(): void {
  deliveries.clear();
}
