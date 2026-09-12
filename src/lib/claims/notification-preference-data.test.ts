import { describe, expect, test } from "bun:test";
import { mapNotificationPreferenceRow } from "./notification-preference-data";

describe("claim notification preference data", () => {
  test("maps persisted preferences into UI values", () => {
    const value = mapNotificationPreferenceRow({
      email: "worker@example.com",
      mobile: "+67570001234",
      preferred_channel: "sms",
      notifications_enabled: true,
    });

    expect(value).toEqual({
      email: "worker@example.com",
      mobile: "+67570001234",
      preferredChannel: "sms",
      enabled: true,
    });
  });

  test("uses safe defaults for missing values", () => {
    expect(mapNotificationPreferenceRow({})).toEqual({
      email: "",
      mobile: "",
      preferredChannel: "sms",
      enabled: true,
    });
  });
});
