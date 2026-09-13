import { describe, expect, test } from "bun:test";

const routes = [
  ["src/app/api/integrations/irc/compliance/route.ts", "ircSchema", "checkTaxCompliance"],
  ["src/app/api/integrations/employment/verify/route.ts", "employmentSchema", "verifyEmployment"],
  ["src/app/api/integrations/medical/verify/route.ts", "medicalSchema", "verifyMedicalCertificate"],
  ["src/app/api/integrations/insurance/verify/route.ts", "insuranceSchema", "verifyInsurancePolicy"],
  ["src/app/api/integrations/bank/accounts/verify/route.ts", "bankAccountSchema", "verifyBankAccount"],
  ["src/app/api/integrations/bank/payments/process/route.ts", "bankPaymentSchema", "processSandboxPayment"],
  ["src/app/api/integrations/notifications/send/route.ts", "notificationSchema", "sendSandboxNotification"],
] as const;

async function read(path: string) {
  return Bun.file(path).text();
}

describe("OWC synthetic government integration HTTP facade", () => {
  test("exposes every implemented synthetic agency capability through guarded API routes", async () => {
    for (const [path, schema, operation] of routes) {
      expect(await Bun.file(path).exists()).toBe(true);
      const source = await read(path);
      expect(source).toContain("handleSandboxPost");
      expect(source).toContain(schema);
      expect(source).toContain(operation);
    }
  });

  test("keeps the whole facade behind the existing explicit sandbox safety boundary", async () => {
    const http = await read("src/lib/integrations/sandbox/http.ts");
    const env = await read(".env.example");
    expect(http).toContain("OWC_ENABLE_SANDBOX");
    expect(env).toContain('OWC_ENABLE_SANDBOX="false"');
    for (const [path] of routes) {
      expect(await read(path)).toContain("handleSandboxPost");
    }
  });

  test("uses the existing bounded schemas and rate-limit keys rather than arbitrary proxying", async () => {
    for (const [path] of routes) {
      const source = await read(path);
      expect(source).toContain("rateLimitKey:");
      expect(source).not.toContain("request.url");
      expect(source).not.toContain("fetch(");
    }
  });

  test("documents every reference agency as synthetic and replaceable post-award", async () => {
    const path = "docs/operations/reference-government-integration-facade.md";
    expect(await Bun.file(path).exists()).toBe(true);
    const doc = await read(path);
    for (const term of ["NID", "IPA", "IRC", "employment", "medical", "insurance", "bank", "notifications"]) {
      expect(doc).toContain(term);
    }
    expect(doc).toContain("synthetic");
    expect(doc).toContain("post-award");
    expect(doc).toContain("production");
  });
});
