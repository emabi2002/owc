import { describe, expect, test } from "bun:test";
import {
  buildClaimNotification,
  notificationEventForTransition,
} from "./notifications";

describe("claim lifecycle notifications", () => {
  test("maps key claim transitions to notification events", () => {
    expect(notificationEventForTransition("New", "Under Assessment")).toBe("ASSESSMENT_STARTED");
    expect(notificationEventForTransition("Under Assessment", "Awaiting Documents")).toBe("DOCUMENT_REQUIRED");
    expect(notificationEventForTransition("Under Assessment", "Approved")).toBe("CLAIM_APPROVED");
    expect(notificationEventForTransition("Approved", "Paid")).toBe("PAYMENT_PROCESSED");
  });

  test("creates claimant-safe messages without exposing medical or banking details", () => {
    const notification = buildClaimNotification({
      event: "CLAIM_APPROVED",
      claimReference: "OWC-2026-004821",
      claimantName: "John Kila",
    });

    expect(notification.subject).toContain("OWC-2026-004821");
    expect(notification.message).toContain("approved");
    expect(notification.message).not.toContain("diagnosis");
    expect(notification.message).not.toContain("account");
  });

  test("returns no automatic event for unsupported transition pairs", () => {
    expect(notificationEventForTransition("Approved", "Under Assessment")).toBeNull();
  });
});
