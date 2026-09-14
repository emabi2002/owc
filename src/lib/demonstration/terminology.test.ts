import { describe, expect, test } from "bun:test";
import {
  DEMONSTRATION_BANNER,
  verifyDemonstrationTerminology,
} from "./terminology";

describe("OWC demonstration terminology", () => {
  test("uses an explicit synthetic no-real-payments banner", () => {
    expect(DEMONSTRATION_BANNER).toBe("DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS");
  });

  test("accepts presentation-safe wording", () => {
    expect(
      verifyDemonstrationTerminology(
        "DEMONSTRATION synthetic data. Simulated payment only. productionAcceptance=false. DEMO_HOST_EXTERNAL.",
      ),
    ).toEqual({ ok: true, violations: [] });
  });

  test.each([
    "production accepted",
    "real funds transferred",
    "live payment complete",
    "deployed to OWC production",
  ])("rejects misleading phrase: %s", (phrase) => {
    const result = verifyDemonstrationTerminology(phrase);
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
