import { describe, expect, test } from "bun:test";
import type { NotificationDeliveryRequest } from "./notification-delivery";
import {
  deliverReferenceClaimNotification,
  isReferenceNotificationGatewayEnabled,
  listReferenceNotificationDeliveries,
  resetReferenceNotificationDeliveries,
} from "./reference-notification-gateway";

const request: NotificationDeliveryRequest = {
  channel: "email",
  recipient: "claimant.demo@example.test",
  subject: "OWC claim CPPS-REF-2026-000001 approved",
  message: "Your synthetic demonstration claim has been approved.",
  claimReference: "CPPS-REF-2026-000001",
  event: "CLAIM_APPROVED",
};

describe("OWC reference notification gateway behavior", () => {
  test("enables only for the exact true value", () => {
    expect(isReferenceNotificationGatewayEnabled("true")).toBe(true);
    expect(isReferenceNotificationGatewayEnabled("TRUE")).toBe(false);
    expect(isReferenceNotificationGatewayEnabled("1")).toBe(false);
    expect(isReferenceNotificationGatewayEnabled(undefined)).toBe(false);
  });

  test("records a deterministic synthetic delivery without contacting a provider", async () => {
    resetReferenceNotificationDeliveries();
    const first = await deliverReferenceClaimNotification(request);
    const second = await deliverReferenceClaimNotification(request);

    expect(first.status).toBe("sent");
    expect(first.providerMessageId).toBe(second.providerMessageId);
    expect(first).toMatchObject({
      source: "reference",
      productionConnected: false,
      deterministic: true,
    });
    expect(listReferenceNotificationDeliveries()).toHaveLength(1);
  });

  test("supports both email and SMS demonstration channels", async () => {
    resetReferenceNotificationDeliveries();
    await deliverReferenceClaimNotification(request);
    await deliverReferenceClaimNotification({
      ...request,
      channel: "sms",
      recipient: "+67570000000",
    });
    expect(listReferenceNotificationDeliveries().map((item) => item.channel).sort()).toEqual([
      "email",
      "sms",
    ]);
  });
});
