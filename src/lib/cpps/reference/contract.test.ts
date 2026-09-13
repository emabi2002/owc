import { describe, expect, test } from "bun:test";
import { createReferenceCppsService } from "./service";
import { toCppsClaimStatus } from "./contract";

const lodgeInput = {
  workerName: "Mara Kila",
  employerName: "Pacific Engineering Demo Ltd",
  weeklyWage: "1200.00",
  injuryDate: "2026-08-20",
  injuryType: "Fracture",
  description: "Synthetic workplace injury used only for OWC reference-system testing.",
};

describe("reference CPPS contract adapter", () => {
  test("maps the richer reference claim into the existing OWC claim tracking shape", () => {
    const service = createReferenceCppsService({
      now: () => new Date("2026-09-13T10:00:00.000Z"),
    });
    const claim = service.registerClaim(lodgeInput);
    service.transitionClaim(claim.reference, "registration_review");
    service.transitionClaim(claim.reference, "medical_review");

    const status = toCppsClaimStatus(service.getClaim(claim.reference)!);

    expect(status.reference).toBe(claim.reference);
    expect(status.worker).toBe("Mara Kila");
    expect(status.employer).toBe("Pacific Engineering Demo Ltd");
    expect(status.injuryDate).toBe("2026-08-20");
    expect(status.lodged).toBe("2026-09-13T10:00:00.000Z");
    expect(status.type).toBe("Fracture");
    expect(status.status).toBe("Medical Review");
    expect(status.steps.map((step) => step.label)).toEqual([
      "Claim received",
      "Registration review",
      "Medical review",
      "Assessment",
      "Decision",
      "Payment",
      "Closed",
    ]);
    expect(status.steps[0]?.done).toBe(true);
    expect(status.steps[1]?.done).toBe(true);
    expect(status.steps[2]?.done).toBe(true);
    expect(status.steps[3]?.done).toBe(false);
  });

  test("represents a rejected decision without falsely marking payment complete", () => {
    const service = createReferenceCppsService({
      now: () => new Date("2026-09-13T10:00:00.000Z"),
    });
    const claim = service.registerClaim(lodgeInput);
    service.transitionClaim(claim.reference, "registration_review");
    service.transitionClaim(claim.reference, "medical_review");
    service.transitionClaim(claim.reference, "rejected");

    const status = toCppsClaimStatus(service.getClaim(claim.reference)!);

    expect(status.status).toBe("Rejected");
    expect(status.steps.find((step) => step.label === "Decision")?.done).toBe(true);
    expect(status.steps.find((step) => step.label === "Payment")?.done).toBe(false);
  });
});
