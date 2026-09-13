import { describe, expect, test } from "bun:test";
import { planClaimTransition } from "./transition";

describe("claim transition planning", () => {
  test("accepts a valid transition and selects its notification", () => {
    const plan = planClaimTransition("Under Assessment", "Approved");
    expect(plan.ok).toBe(true);
    if (plan.ok) {
      expect(plan.notificationEvent).toBe("CLAIM_APPROVED");
      expect(plan.to).toBe("Approved");
    }
  });

  test("rejects invalid reverse transitions", () => {
    const plan = planClaimTransition("Paid", "Under Assessment");
    expect(plan.ok).toBe(false);
  });

  test("allows valid transitions that do not require a claimant message", () => {
    const plan = planClaimTransition("Awaiting Documents", "Under Assessment");
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.notificationEvent).toBe("ASSESSMENT_STARTED");
  });
});
