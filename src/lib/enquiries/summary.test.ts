import { describe, expect, test } from "bun:test";
import type { AiAdapter } from "@/lib/ai/types";
import { buildProfessionalEnquirySummary } from "./summary";
import type { RoutingResult } from "./routing";

const route: RoutingResult = {
  category: "Medical Evidence",
  priority: "normal",
  escalation: false,
  destination: { id: "medical-unit", label: "Medical Evidence Unit", kind: "unit", email: "medical@example.test" },
  fallbackUsed: false,
  reason: "Classified as Medical Evidence",
};

describe("OWC public enquiry professional summary", () => {
  test("preserves supplied facts while presenting a professional English officer summary", async () => {
    const result = await buildProfessionalEnquirySummary({
      message: "I injured my back at work and I need to know where to send my medical report.",
      route,
      contact: { name: "Michael Kora", email: "michael@example.test" },
      preferredContact: "email",
    });
    expect(result.category).toBe("Medical Evidence");
    expect(result.routeId).toBe("medical-unit");
    expect(result.professionalSummary).toContain("injured my back at work");
    expect(result.professionalSummary).toContain("Medical Evidence");
    expect(result.professionalSummary).toContain("email");
    expect(result.professionalSummary).not.toContain("phone:");
  });

  test("does not invent claimant, officer, employer, medical or contact facts", async () => {
    const result = await buildProfessionalEnquirySummary({
      message: "My WC-1 form was returned and I want to know why.",
      route: { ...route, category: "Claims", destination: { id: "claims-unit", label: "Claims Unit", kind: "unit" } },
      contact: { name: "Lina Aro", phone: "+67570000000" },
      preferredContact: "phone",
    });
    const lower = result.professionalSummary.toLowerCase();
    expect(lower).not.toContain("employer:");
    expect(lower).not.toContain("doctor:");
    expect(lower).not.toContain("officer:");
    expect(lower).not.toContain("email:");
    expect(result.professionalSummary).toContain("+67570000000");
  });

  test("a live AI rewrite cannot change the server-selected classification or route", async () => {
    const adapter: AiAdapter = {
      async generate() {
        return {
          ok: true,
          provider: "openai_compatible",
          source: "live",
          productionConnected: true,
          text: "User seeks assistance submitting a medical report following a workplace back injury.",
        };
      },
    };
    const result = await buildProfessionalEnquirySummary({
      message: "I injured my back at work and need to submit my medical report.",
      route,
      contact: { name: "Michael Kora", email: "michael@example.test" },
      preferredContact: "email",
      ai: { provider: "openai_compatible", adapter },
    });
    expect(result.category).toBe("Medical Evidence");
    expect(result.routeId).toBe("medical-unit");
    expect(result.professionalSummary).toContain("medical report");
  });

  test("provider failure safely falls back to deterministic professional summary", async () => {
    const adapter: AiAdapter = {
      async generate() {
        throw new Error("network unavailable");
      },
    };
    const result = await buildProfessionalEnquirySummary({
      message: "I need help submitting my medical report.",
      route,
      contact: { name: "Michael Kora", email: "michael@example.test" },
      preferredContact: "email",
      ai: { provider: "openai_compatible", adapter },
    });
    expect(result.category).toBe("Medical Evidence");
    expect(result.routeId).toBe("medical-unit");
    expect(result.source).toBe("deterministic");
    expect(result.professionalSummary).toContain("I need help submitting my medical report.");
  });
});
