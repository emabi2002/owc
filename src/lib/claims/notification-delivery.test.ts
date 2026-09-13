import { describe, expect, test } from "bun:test";
import {
  buildNotificationGatewayPayload,
  shouldRetryNotification,
} from "./notification-delivery";

describe("claim notification gateway payload", () => {
  test("maps email notification into a minimal provider payload", () => {
    const payload = buildNotificationGatewayPayload({
      channel: "email",
      recipient: "worker@example.com",
      subject: "OWC claim OWC-2026-004821 approved",
      message: "Your claim has been approved.",
      claimReference: "OWC-2026-004821",
      event: "CLAIM_APPROVED",
    });

    expect(payload.channel).toBe("email");
    expect(payload.to).toBe("worker@example.com");
    expect(payload.reference).toBe("OWC-2026-004821");
    expect(payload.metadata).toEqual({ event: "CLAIM_APPROVED" });
  });
});

describe("claim notification retry policy", () => {
  test("retries queued and failed deliveries while attempts remain", () => {
    expect(shouldRetryNotification("queued", 0)).toBe(true);
    expect(shouldRetryNotification("failed", 1)).toBe(true);
    expect(shouldRetryNotification("failed", 2)).toBe(true);
  });

  test("treats sent, suppressed and exhausted deliveries as terminal", () => {
    expect(shouldRetryNotification("sent", 0)).toBe(false);
    expect(shouldRetryNotification("suppressed", 0)).toBe(false);
    expect(shouldRetryNotification("failed", 3)).toBe(false);
  });
});
