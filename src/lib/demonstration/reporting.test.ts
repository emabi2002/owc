import { describe, expect, test } from "bun:test";
import { buildDemonstrationReport } from "./reporting";

describe("OWC demonstration reporting", () => {
  test("summarizes the deterministic 20-claim presentation pack", () => {
    const report = buildDemonstrationReport();

    expect(report.environment).toBe("DEMONSTRATION");
    expect(report.syntheticData).toBe(true);
    expect(report.productionAcceptance).toBe(false);
    expect(report.totalClaims).toBe(20);
    expect(report.statusCounts).toEqual({
      RECEIVED: 2,
      DOCUMENTS_REQUIRED: 3,
      ASSESSMENT: 3,
      APPROVED: 3,
      DECLINED: 2,
      PAYMENT_SCHEDULED: 2,
      SIMULATED_PAYMENT: 2,
      CLOSED: 3,
    });
    expect(report.decisionCounts).toEqual({ PENDING: 8, APPROVED: 10, DECLINED: 2 });
    expect(report.notificationFailures).toBe(1);
    expect(report.averageTurnaroundDays).toBe(6.55);
  });

  test("labels all payment reporting as illustrative simulation only", () => {
    const report = buildDemonstrationReport();

    expect(report.completedSimulatedPayments).toBe(2);
    expect(report.illustrativePaymentAmountPgk).toBe(80550);
    expect(report.paymentEvidence).toEqual({ simulation: true, moneyMovement: false });
  });

  test("provides a dedicated presentation dashboard", async () => {
    expect(await Bun.file("src/app/admin/(dashboard)/demonstration/page.tsx").exists()).toBe(true);
  });
});
