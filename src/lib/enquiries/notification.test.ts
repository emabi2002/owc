import { describe, expect, test } from "bun:test";
import { deliverPublicEnquiryNotification } from "./notification";
import type { RouteDestination } from "./routing";

const EMAIL_DESTINATION: RouteDestination = {
  id: "claims-unit",
  label: "Claims Unit",
  kind: "unit",
  email: "claims@example.test",
};

const BASE = {
  reference: "OWC-ENQ-20260914-ABC123",
  destination: EMAIL_DESTINATION,
  professionalSummary: "Enquiry category: Claims\nIssue summary: Please help with my claim enquiry.",
  priority: "normal" as const,
};

describe("OWC public enquiry notification transport", () => {
  test("configured live notification transport is authoritative", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ messageId: "LIVE-123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const result = await deliverPublicEnquiryNotification(BASE, {
      notificationApiUrl: "https://notify.example.test/messages",
      notificationApiKey: "secret-test-key",
      referenceEnabled: true,
      fetchImpl,
    });

    expect(result.status).toBe("sent");
    expect(result.source).toBe("live");
    expect(result.productionConnected).toBe(true);
    expect(result.providerMessageId).toBe("LIVE-123");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.init?.headers).toEqual(expect.objectContaining({ Authorization: "Bearer secret-test-key" }));
  });

  test("reference mode is explicit and never claims a real officer was contacted", async () => {
    const result = await deliverPublicEnquiryNotification(BASE, {
      notificationApiUrl: "",
      referenceEnabled: true,
    });

    expect(result.status).toBe("sent");
    expect(result.source).toBe("reference");
    expect(result.productionConnected).toBe(false);
    expect(result.deterministic).toBe(true);
    expect(result.providerMessageId).toMatch(/^REF-ENQ-NOTIFY-/);
    expect(result.deliveryNotice).toContain("no real message was sent");
  });

  test("missing destination contact is suppressed", async () => {
    const result = await deliverPublicEnquiryNotification(
      {
        ...BASE,
        destination: { id: "central", label: "Central OWC Enquiry Queue", kind: "central" },
      },
      { referenceEnabled: true },
    );

    expect(result.status).toBe("suppressed");
    expect(result.source).toBe("none");
    expect(result.productionConnected).toBe(false);
  });

  test("live provider failure does not silently fall back to reference success", async () => {
    const result = await deliverPublicEnquiryNotification(BASE, {
      notificationApiUrl: "https://notify.example.test/messages",
      referenceEnabled: true,
      fetchImpl: async () => new Response("unavailable", { status: 503 }),
    });

    expect(result.status).toBe("failed");
    expect(result.source).toBe("live");
    expect(result.productionConnected).toBe(true);
    expect(result.providerMessageId).toBeUndefined();
  });
});
