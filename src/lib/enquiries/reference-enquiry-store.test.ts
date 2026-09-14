import { beforeEach, describe, expect, test } from "bun:test";
import {
  clearReferenceEnquiries,
  getReferenceEnquiry,
  persistConfirmedEnquiry,
} from "./persistence";
import type { ConfirmedEnquiryInput } from "./types";

const base: ConfirmedEnquiryInput = {
  confirmed: true,
  name: "Michael Kora",
  email: "michael@example.test",
  phone: null,
  category: "Claims",
  subject: "Claim lodgement assistance",
  message: "I need help lodging my claim.",
  sourceChannel: "web",
  language: "en",
  linkedClaimReference: null,
  aiSummary: "Enquirer requests assistance lodging a workers compensation claim.",
  routeDestination: "claims-unit",
  priority: "normal",
  notificationStatus: "pending",
};

describe("OWC reference public enquiry store", () => {
  beforeEach(() => clearReferenceEnquiries());

  test("refuses to persist a routed enquiry before explicit confirmation", async () => {
    await expect(persistConfirmedEnquiry({ ...base, confirmed: false }, { mode: "reference" })).rejects.toThrow("confirmation");
  });

  test("persists a confirmed enquiry with a stable OWC reference and audit-safe fields", async () => {
    const saved = await persistConfirmedEnquiry(base, {
      mode: "reference",
      now: new Date("2026-09-14T09:00:00.000Z"),
      referenceSuffix: "ABC123",
    });
    expect(saved.reference).toBe("OWC-ENQ-20260914-ABC123");
    expect(saved.confirmedAt).toBe("2026-09-14T09:00:00.000Z");
    expect(saved.productionConnected).toBe(false);
    expect(saved.synthetic).toBe(true);
    expect(getReferenceEnquiry(saved.reference)?.aiSummary).toContain("requests assistance");
  });

  test("does not generate a second record for the same confirmation idempotency key", async () => {
    const first = await persistConfirmedEnquiry({ ...base, idempotencyKey: "confirm-123" }, {
      mode: "reference",
      now: new Date("2026-09-14T09:00:00.000Z"),
      referenceSuffix: "ABC123",
    });
    const second = await persistConfirmedEnquiry({ ...base, idempotencyKey: "confirm-123" }, {
      mode: "reference",
      now: new Date("2026-09-14T09:01:00.000Z"),
      referenceSuffix: "ZZZ999",
    });
    expect(second.reference).toBe(first.reference);
  });
});
