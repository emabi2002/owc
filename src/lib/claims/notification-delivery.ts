import { serverEnv } from "@/lib/env";
import type { ClaimNotificationEvent } from "./notifications";

export type NotificationChannel = "email" | "sms";

export type NotificationDeliveryRequest = {
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  claimReference: string;
  event: ClaimNotificationEvent;
};

export type NotificationDeliveryResult = {
  status: "sent" | "queued" | "failed" | "suppressed";
  providerMessageId?: string;
  error?: string;
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

export async function deliverClaimNotification(
  input: NotificationDeliveryRequest,
): Promise<NotificationDeliveryResult> {
  if (!input.recipient.trim()) {
    return { status: "suppressed", error: "No recipient configured" };
  }

  if (!serverEnv.notificationApiUrl) {
    return { status: "queued" };
  }

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
