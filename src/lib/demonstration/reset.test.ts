import { describe, expect, test } from "bun:test";
import { listDemoIdentityEvents, recordDemoIdentityEvent } from "@/lib/auth/demo-identity";
import { listReferenceEvidence, storeReferenceEvidence } from "@/lib/claims/reference-evidence-repository";
import { deliverReferenceClaimNotification, listReferenceNotificationDeliveries } from "@/lib/claims/reference-notification-gateway";
import { referenceCppsService } from "@/lib/cpps/reference/runtime";
import { processSandboxPayment, listSandboxPayments } from "@/lib/integrations/sandbox/agencies";
import { listIntegrationEvents } from "@/lib/integrations/sandbox/events";
import { listSandboxServiceStatuses, setSandboxServiceStatus } from "@/lib/integrations/sandbox/state";
import { DEMONSTRATION_CLAIMS } from "./data-pack";
import { isDemonstrationResetEnabled, resetDemonstrationEnvironment } from "./reset";

describe("OWC deterministic demonstration data and reset", () => {
  test("ships a realistic deterministic claim pack spanning the presentation lifecycle", () => {
    expect(DEMONSTRATION_CLAIMS.length).toBeGreaterThanOrEqual(15);
    expect(DEMONSTRATION_CLAIMS.length).toBeLessThanOrEqual(30);
    expect(new Set(DEMONSTRATION_CLAIMS.map((claim) => claim.reference)).size).toBe(DEMONSTRATION_CLAIMS.length);

    const statuses = new Set(DEMONSTRATION_CLAIMS.map((claim) => claim.status));
    for (const required of [
      "RECEIVED",
      "DOCUMENTS_REQUIRED",
      "ASSESSMENT",
      "APPROVED",
      "DECLINED",
      "PAYMENT_SCHEDULED",
      "SIMULATED_PAYMENT",
      "CLOSED",
    ]) {
      expect(statuses.has(required as never)).toBe(true);
    }

    expect(DEMONSTRATION_CLAIMS.every((claim) => claim.synthetic)).toBe(true);
  });

  test("reset is enabled only by an explicit demonstration identity and reset flag", () => {
    expect(isDemonstrationResetEnabled({ identityMode: "live", resetEnabled: "true" })).toBe(false);
    expect(isDemonstrationResetEnabled({ identityMode: "demonstration", resetEnabled: "false" })).toBe(false);
    expect(isDemonstrationResetEnabled({ identityMode: "demonstration", resetEnabled: "true" })).toBe(true);
  });

  test("restores every process-local presentation subsystem to a clean known state", async () => {
    const previousIdentityMode = process.env.OWC_IDENTITY_MODE;
    const previousResetEnabled = process.env.OWC_ENABLE_DEMO_RESET;

    try {
      process.env.OWC_IDENTITY_MODE = "demonstration";
      process.env.OWC_ENABLE_DEMO_RESET = "true";

      recordDemoIdentityEvent("login_succeeded", {
        personaId: "administrator",
        email: "admin.demo@owc.gov.pg",
      });
      setSandboxServiceStatus("nid", "offline");
      processSandboxPayment({
        idempotencyKey: "RESET-TEST-PAYMENT",
        claimReference: "OWC-2026-005112",
        accountReference: "BANK-ACC-7842",
        amountPgk: 100,
      });
      await deliverReferenceClaimNotification({
        channel: "sms",
        recipient: "+67570000001",
        subject: "Reset test",
        message: "Synthetic reset test",
        claimReference: "OWC-2026-005112",
        event: "payment_processed",
      });
      await storeReferenceEvidence({
        claimReference: "OWC-2026-005112",
        category: "Other",
        title: "Reset test evidence",
        fileName: "reset-test.pdf",
        mimeType: "application/pdf",
        bytes: new TextEncoder().encode("synthetic reset evidence").buffer,
        uploadedBy: "reset-test",
        securityScan: "clean",
        legalHold: false,
      });
      referenceCppsService.registerClaim({
        workerName: "Reset Test Worker",
        workerPhone: "+67570000001",
        workerEmail: "reset@example.test",
        employerName: "Reset Test Employer",
        province: "National Capital District",
        occupation: "Tester",
        weeklyWage: 1000,
        injuryDate: "2026-09-01",
        injuryType: "Synthetic",
        description: "Synthetic reset test claim",
        documentCount: 0,
      });

      const report = await resetDemonstrationEnvironment();

      expect(report.source).toBe("demonstration");
      expect(report.synthetic).toBe(true);
      expect(report.productionConnected).toBe(false);
      expect(report.claimPackCount).toBe(DEMONSTRATION_CLAIMS.length);
      expect(listDemoIdentityEvents()).toHaveLength(0);
      expect(listSandboxPayments()).toHaveLength(0);
      expect(listReferenceNotificationDeliveries()).toHaveLength(0);
      expect(listIntegrationEvents()).toHaveLength(0);
      expect(listSandboxServiceStatuses().every((item) => item.status === "online")).toBe(true);
      expect((await listReferenceEvidence("OWC-2026-005112")).some((item) => item.title === "Reset test evidence")).toBe(false);
      expect(referenceCppsService.getClaim("CPPS-REF-2026-000001")).toBeUndefined();
    } finally {
      if (previousIdentityMode === undefined) delete process.env.OWC_IDENTITY_MODE;
      else process.env.OWC_IDENTITY_MODE = previousIdentityMode;

      if (previousResetEnabled === undefined) delete process.env.OWC_ENABLE_DEMO_RESET;
      else process.env.OWC_ENABLE_DEMO_RESET = previousResetEnabled;
    }
  });
});
