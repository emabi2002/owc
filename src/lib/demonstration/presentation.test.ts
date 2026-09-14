import { describe, expect, test } from "bun:test";
import { buildPresentationGuide } from "./presentation";

describe("OWC demonstration presentation guide", () => {
  test("covers every configured demonstration persona", () => {
    const guide = buildPresentationGuide();
    expect(guide.environment).toBe("DEMONSTRATION");
    expect(guide.syntheticData).toBe(true);
    expect(guide.productionAcceptance).toBe(false);
    expect(guide.personas.map((persona) => persona.personaId)).toEqual([
      "administrator",
      "claims-officer",
      "assessment-officer",
      "finance-officer",
      "content-editor",
      "employer-representative",
      "claimant-worker",
    ]);
  });

  test("covers every Task 9 presentation scenario", () => {
    const guide = buildPresentationGuide();
    expect(guide.scenarios.map((scenario) => scenario.id)).toEqual([
      "DEMO-UAT-001",
      "DEMO-UAT-002",
      "DEMO-UAT-003",
      "DEMO-UAT-004",
      "DEMO-UAT-005",
      "DEMO-UAT-006",
      "DEMO-UAT-007",
    ]);
    expect(guide.boundaries).toContain("No real funds move");
    expect(guide.boundaries).toContain("DEMO_HOST_EXTERNAL");
  });

  test("provides the presenter script", async () => {
    expect(await Bun.file("docs/demonstration/presentation-script.md").exists()).toBe(true);
  });
});
