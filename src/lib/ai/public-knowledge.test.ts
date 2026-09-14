import { describe, expect, test } from "bun:test";
import { SEED_FAQS, SEED_FORMS } from "@/lib/db/seed";
import { buildPublicKnowledge, findPublicKnowledge } from "./public-knowledge";
import { publicAssistantRequestSchema } from "./public-validation";

describe("OWC public AI knowledge contract", () => {
  const knowledge = buildPublicKnowledge(SEED_FAQS, SEED_FORMS);

  test("projects approved public FAQs and forms only", () => {
    expect(knowledge.some((item) => item.sourceType === "faq" && item.title.includes("documents"))).toBe(true);
    expect(knowledge.some((item) => item.sourceType === "form" && item.title.includes("Worker's Application"))).toBe(true);
    expect(knowledge.every((item) => item.visibility === "public")).toBe(true);
  });

  test("returns grounded public knowledge for common claim guidance", () => {
    const result = findPublicKnowledge("What documents do I need to lodge a workers compensation claim?", knowledge);
    expect(result.uncertain).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.some((item) => item.content.includes("WC-1") || item.title.includes("Application"))).toBe(true);
  });

  test("marks unsupported knowledge as uncertain rather than inventing an answer", () => {
    const result = findPublicKnowledge("What is the private management forecast for next quarter?", knowledge);
    expect(result.uncertain).toBe(true);
    expect(result.items).toEqual([]);
  });

  test("does not project management, claimant, payment-account or audit datasets", () => {
    const serialized = JSON.stringify(knowledge).toLowerCase();
    for (const forbidden of ["managementreport", "claim_tracking", "audit_logs", "bank account", "service_role_key"]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  test("validates all approved channels, two languages and bounded conversation history", () => {
    for (const channel of ["web", "android", "ios", "tablet"] as const) {
      expect(publicAssistantRequestSchema.safeParse({ message: "How do I lodge a claim?", channel }).success).toBe(true);
    }
    expect(publicAssistantRequestSchema.safeParse({ message: "Help", channel: "web", locale: "en" }).success).toBe(true);
    expect(publicAssistantRequestSchema.safeParse({ message: "Help", channel: "web", locale: "tpi" }).success).toBe(true);
    expect(publicAssistantRequestSchema.safeParse({ message: "x".repeat(4001), channel: "web" }).success).toBe(false);
    expect(publicAssistantRequestSchema.safeParse({
      message: "Help",
      channel: "web",
      conversation: Array.from({ length: 13 }, () => ({ role: "user", text: "previous" })),
    }).success).toBe(false);
  });
});
