import { serverEnv } from "@/lib/env";
import type { ClaimNotificationEvent } from "./notifications";
import {
  deliverReferenceClaimNotification,
  isReferenceNotificationGatewayEnabled,
} from "./reference-notification-gateway";

export type NotificationChannel = "email" | "sms";
export type NotificationDeliveryStatus = "sent" | "queued" | "failed" | "suppressed";

export type NotificationDeliveryRequest = {
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  claimReference: string;
  event: ClaimNotificationEvent;
};

export type NotificationDeliveryResult = {
  status: NotificationDeliveryStatus;
  providerMessageId?: string;
  error?: string;
  source?: "reference";
  productionConnected?: false;
  deterministic?: true;
};

export function buildNotificationGatewayPayload(input: NotificationDeliveryRequest) {
  return {
    channel: input.channel,
    to: input.recipient,
    subject: input.subject,
    message: input.message,
    reference: input.claimReference,
    metadata: { event: input.event },
  };
}

export function shouldRetryNotification(
  status: NotificationDeliveryStatus,
  attemptCount: number,
  maxAttempts = 3,
): boolean {
  if (status === "sent" || status === "suppressed") return false;
  if (!Number.isFinite(attemptCount) || attemptCount < 0) return false;
  if (!Number.isFinite(maxAttempts) || maxAttempts <= 0) return false;
  return attemptCount < maxAttempts;
}

export async function deliverClaimNotification(
  input: NotificationDeliveryRequest,
): Promise<NotificationDeliveryResult> {
  if (!input.recipient.trim()) {
    return { status: "suppressed", error: "No recipient configured" };
  }

  // A configured live notification gateway is always authoritative. Live
  // transport failures do not silently fall back to a synthetic success.
  if (serverEnv.notificationApiUrl) {
    try {
      const response = await fetch(serverEnv.notificationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(serverEnv.notificationApiKey
            ? { Authorization: `Bearer ${serverEnv.notificationApiKey}` }
            : {}),
        },
        body: JSON.stringify(buildNotificationGatewayPayload(input)),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return {
          status: "failed",
          error: `Notification gateway returned HTTP ${response.status}`,
        };
      }

      const body = (await response.json().catch(() => ({}))) as {
        id?: string;
        messageId?: string;
      };

      return {
        status: "sent",
        providerMessageId: body.messageId ?? body.id,
      };
    } catch (error) {
      return {
        status: "failed",
        error: error instanceof Error ? error.message : "Notification delivery failed",
      };
    }
  }

  const referenceEnabled = isReferenceNotificationGatewayEnabled(
    process.env.OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY,
  );
  if (referenceEnabled) {
    return deliverReferenceClaimNotification(input);
  }

  return { status: "queued" };
}
