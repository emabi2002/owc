import { describe, expect, test } from "bun:test";
import { claimNotificationPreferenceSchema } from "./notification-preferences";

describe("claim notification preferences", () => {
  test("accepts email and PNG-style mobile preferences", () => {
    expect(
      claimNotificationPreferenceSchema.safeParse({
        email: "worker@example.com",
        mobile: "+67570001234",
        preferredChannel: "sms",
        enabled: true,
      }).success,
    ).toBe(true);
  });

  test("rejects an email preference without a valid email address", () => {
    expect(
      claimNotificationPreferenceSchema.safeParse({
        email: "invalid",
        mobile: "",
        preferredChannel: "email",
        enabled: true,
      }).success,
    ).toBe(false);
  });
});
