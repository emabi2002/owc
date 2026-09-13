import { describe, expect, test } from "bun:test";
import { mapNotificationRow } from "./notification-history";

describe("claim notification history", () => {
  test("maps database notification rows into UI records", () => {
    const item = mapNotificationRow({
      id: "n-1",
      event: "CLAIM_APPROVED",
      channel: "sms",
      recipient: "+67570000000",
      subject: "Approved",
      status: "sent",
      created_at: "2026-09-12T10:00:00Z",
    });
    expect(item.event).toBe("CLAIM_APPROVED");
    expect(item.channel).toBe("SMS");
    expect(item.status).toBe("Sent");
  });
});
