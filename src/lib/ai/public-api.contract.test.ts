import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { publicAssistantRequestSchema } from "./public-validation";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("OWC web and mobile public AI API contract", () => {
  test("assistant request contract accepts all approved client channels", () => {
    for (const channel of ["web", "android", "ios", "tablet"] as const) {
      expect(publicAssistantRequestSchema.safeParse({ message: "How do I lodge a claim?", channel }).success).toBe(true);
    }
  });

  test("provides separate guidance and confirmed-referral endpoints", () => {
    const assistant = read("src/app/api/public/assistant/route.ts");
    const referrals = read("src/app/api/public/assistant/referrals/route.ts");
    const validation = read("src/lib/ai/public-validation.ts");

    expect(assistant).toContain("publicAssistantRequestSchema");
    expect(assistant).toContain("answerPublicAssistant");
    expect(assistant).toContain("rateLimit(");
    expect(assistant).toContain("getClientIp");

    expect(validation).toContain("confirmed: z.literal(true)");
    expect(referrals).toContain("publicReferralRequestSchema");
    expect(referrals).toContain("routeEnquiry");
    expect(referrals).toContain("buildProfessionalEnquirySummary");
    expect(referrals).toContain("persistConfirmedEnquiry");
    expect(referrals).toContain("deliverPublicEnquiryNotification");
    expect(referrals).toContain("recordAudit");
  });

  test("referral route revalidates routing server-side and never trusts a client route", () => {
    const referrals = read("src/app/api/public/assistant/referrals/route.ts");
    expect(referrals).toContain("routeEnquiry(");
    expect(referrals).not.toContain("routeDestination: parsed.data.routeDestination");
    expect(referrals).not.toContain("destination: parsed.data.destination");
  });

  test("public endpoints remain isolated from management reporting and management AI", () => {
    const assistant = read("src/app/api/public/assistant/route.ts");
    const referrals = read("src/app/api/public/assistant/referrals/route.ts");
    for (const source of [assistant, referrals]) {
      expect(source).not.toContain("@/lib/reporting");
      expect(source).not.toContain("management-analyst");
      expect(source).not.toContain("reports.ai.query");
      expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });

  test("responses are non-cacheable and public abuse is IP/channel rate limited", () => {
    const assistant = read("src/app/api/public/assistant/route.ts");
    const referrals = read("src/app/api/public/assistant/referrals/route.ts");
    expect(assistant).toContain('"Cache-Control": "no-store"');
    expect(referrals).toContain('"Cache-Control": "no-store"');
    expect(assistant).toContain("public-ai:${ip}:${parsed.data.channel}");
    expect(referrals).toContain("public-ai-referral:${ip}:${parsed.data.channel}");
  });
});
