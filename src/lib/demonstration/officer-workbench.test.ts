import { describe, expect, test } from "bun:test";
import { buildOfficerWorkbench } from "./officer-workbench";

describe("OWC demonstration officer workbenches", () => {
  test("gives claims officers received and document-required claims", () => {
    const workbench = buildOfficerWorkbench("claims-officer");
    expect(workbench.environment).toBe("DEMONSTRATION");
    expect(workbench.productionAcceptance).toBe(false);
    expect(workbench.claims).toHaveLength(5);
    expect(new Set(workbench.claims.map((claim) => claim.status))).toEqual(
      new Set(["RECEIVED", "DOCUMENTS_REQUIRED"]),
    );
  });

  test("gives assessment officers only assessment claims", () => {
    const workbench = buildOfficerWorkbench("assessment-officer");
    expect(workbench.claims).toHaveLength(3);
    expect(workbench.claims.every((claim) => claim.status === "ASSESSMENT")).toBe(true);
  });

  test("gives finance officers approved and simulated-payment presentation work", () => {
    const workbench = buildOfficerWorkbench("finance-officer");
    expect(workbench.claims).toHaveLength(7);
    expect(
      workbench.claims.every((claim) =>
        ["APPROVED", "PAYMENT_SCHEDULED", "SIMULATED_PAYMENT"].includes(claim.status),
      ),
    ).toBe(true);
    expect(workbench.moneyMovement).toBe(false);
  });

  test("provides list and detail presentation screens", async () => {
    expect(await Bun.file("src/app/admin/(dashboard)/demonstration/officer/page.tsx").exists()).toBe(true);
    expect(
      await Bun.file("src/app/admin/(dashboard)/demonstration/officer/[reference]/page.tsx").exists(),
    ).toBe(true);
  });
});
