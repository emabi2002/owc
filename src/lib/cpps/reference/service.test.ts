import { describe, expect, test } from "bun:test";
import { createReferenceCppsService } from "./service";

const lodgeInput = {
  workerName: "Mara Kila",
  workerPhone: "+67570000001",
  workerEmail: "mara.kila@example.test",
  employerName: "Pacific Engineering Demo Ltd",
  province: "National Capital District",
  occupation: "Heavy Equipment Operator",
  weeklyWage: "1200.00",
  injuryDate: "2026-08-20",
  injuryType: "Fracture",
  description: "Synthetic workplace injury used only for OWC reference-system testing.",
  documentCount: 2,
};

describe("reference CPPS service", () => {
  test("registers and retrieves a synthetic claim with an auditable initial state", () => {
    const service = createReferenceCppsService({ now: () => new Date("2026-09-13T10:00:00.000Z") });

    const claim = service.registerClaim(lodgeInput);
    const stored = service.getClaim(claim.reference);

    expect(claim.source).toBe("reference");
    expect(claim.state).toBe("received");
    expect(claim.reference).toMatch(/^CPPS-REF-2026-/);
    expect(stored?.reference).toBe(claim.reference);
    expect(stored?.events).toHaveLength(1);
    expect(stored?.events[0]?.toState).toBe("received");
  });

  test("allows only defined CPPS lifecycle transitions", () => {
    const service = createReferenceCppsService({ now: () => new Date("2026-09-13T10:00:00.000Z") });
    const claim = service.registerClaim(lodgeInput);

    expect(() => service.transitionClaim(claim.reference, "approved")).toThrow(
      "Invalid CPPS transition",
    );

    expect(service.transitionClaim(claim.reference, "registration_review").state).toBe(
      "registration_review",
    );
    expect(service.transitionClaim(claim.reference, "medical_review").state).toBe(
      "medical_review",
    );
    expect(service.transitionClaim(claim.reference, "assessment").state).toBe("assessment");
    expect(service.transitionClaim(claim.reference, "approved").state).toBe("approved");
  });

  test("labels compensation assessment as an assumption and makes synthetic payment idempotent", () => {
    const service = createReferenceCppsService({ now: () => new Date("2026-09-13T10:00:00.000Z") });
    const claim = service.registerClaim(lodgeInput);

    service.transitionClaim(claim.reference, "registration_review");
    service.transitionClaim(claim.reference, "medical_review");
    service.transitionClaim(claim.reference, "assessment");

    const assessed = service.assessClaim(claim.reference, 10);
    expect(assessed.assessment?.amount).toBe(12000);
    expect(assessed.assessment?.basis).toContain("REFERENCE ASSUMPTION");

    service.transitionClaim(claim.reference, "approved");
    service.transitionClaim(claim.reference, "payment_scheduled");
    const first = service.recordSyntheticPayment(claim.reference);
    const second = service.recordSyntheticPayment(claim.reference);

    expect(first.payment?.reference).toBe(second.payment?.reference);
    expect(first.payment?.realFundsMoved).toBe(false);
    expect(first.state).toBe("paid");
  });
});
