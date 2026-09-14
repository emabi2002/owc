import { createHash } from "node:crypto";
import { serverEnv } from "@/lib/env";
import type { EnquiryPriority, RouteDestination } from "./routing";

export type PublicEnquiryNotificationStatus = "sent" | "queued" | "failed" | "suppressed";
export type PublicEnquiryNotificationSource = "live" | "reference" | "none";

export type PublicEnquiryNotificationRequest = {
  reference: string;
  destination: RouteDestination;
  professionalSummary: string;
  priority: EnquiryPriority;
};

export type PublicEnquiryNotificationResult = {
  status: PublicEnquiryNotificationStatus;
  source: PublicEnquiryNotificationSource;
  productionConnected: boolean;
  providerMessageId?: string;
  deterministic?: true;
  deliveryNotice?: string;
  error?: string;
};

type NotificationOptions = {
  notificationApiUrl?: string;
  notificationApiKey?: string;
  referenceEnabled?: boolean;
  fetchImpl?: typeof fetch;
};

function chooseRecipient(destination: RouteDestination): { channel: "email" | "sms"; recipient: string } | null {
  const email = destination.email?.trim();
  if (email) return { channel: "email", recipient: email };
  const phone = destination.phone?.trim();
  if (phone) return { channel: "sms", recipient: phone };
  return null;
}

function referenceMessageId(input: PublicEnquiryNotificationRequest, recipient: string): string {
  const digest = createHash("sha256")
    .update([input.reference, input.destination.id, recipient, input.priority, input.professionalSummary].join("\u001f"))
    .digest("hex")
    .slice(0, 20);
  return `REF-ENQ-NOTIFY-${digest}`;
}

export function buildPublicEnquiryNotificationPayload(
  input: PublicEnquiryNotificationRequest,
  recipient: { channel: "email" | "sms"; recipient: string },
) {
  return {
    channel: recipient.channel,
    to: recipient.recipient,
    subject: `OWC public enquiry ${input.reference} — ${input.priority.toUpperCase()}`,
    message: input.professionalSummary,
    reference: input.reference,
    metadata: {
      event: "public_enquiry_referral",
      routeId: input.destination.id,
      routeLabel: input.destination.label,
      priority: input.priority,
    },
  };
}

export async function deliverPublicEnquiryNotification(
  input: PublicEnquiryNotificationRequest,
  options: NotificationOptions = {},
): Promise<PublicEnquiryNotificationResult> {
  const recipient = chooseRecipient(input.destination);
  if (!recipient) {
    return {
      status: "suppressed",
      source: "none",
      productionConnected: false,
      error: "No approved destination contact is configured.",
    };
  }

  const notificationApiUrl = options.notificationApiUrl ?? serverEnv.notificationApiUrl;
  const notificationApiKey = options.notificationApiKey ?? serverEnv.notificationApiKey;
  const referenceEnabled = options.referenceEnabled ?? process.env.OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY === "true";

  if (notificationApiUrl) {
    const fetchImpl = options.fetchImpl ?? fetch;
    try {
      const response = await fetchImpl(notificationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(notificationApiKey ? { Authorization: `Bearer ${notificationApiKey}` } : {}),
        },
        body: JSON.stringify(buildPublicEnquiryNotificationPayload(input, recipient)),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return {
          status: "failed",
          source: "live",
          productionConnected: true,
          error: `Notification gateway returned HTTP ${response.status}`,
        };
      }

      const body = (await response.json().catch(() => ({}))) as { id?: string; messageId?: string };
      return {
        status: "sent",
        source: "live",
        productionConnected: true,
        providerMessageId: body.messageId ?? body.id,
      };
    } catch (error) {
      return {
        status: "failed",
        source: "live",
        productionConnected: true,
        error: error instanceof Error ? error.message : "Notification delivery failed",
      };
    }
  }

  if (referenceEnabled) {
    return {
      status: "sent",
      source: "reference",
      productionConnected: false,
      deterministic: true,
      providerMessageId: referenceMessageId(input, recipient.recipient),
      deliveryNotice: "Demonstration reference delivery only; no real message was sent and no officer was contacted by this transport.",
    };
  }

  return {
    status: "queued",
    source: "none",
    productionConnected: false,
    deliveryNotice: "No live notification gateway is configured; the enquiry remains recorded for OWC follow-up.",
  };
}
