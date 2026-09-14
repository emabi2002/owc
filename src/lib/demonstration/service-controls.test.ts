import { describe, expect, test } from "bun:test";
import { getSandboxServiceStatus, resetSandboxServiceStatuses } from "@/lib/integrations/sandbox/state";
import {
  isDemonstrationServiceControlEnabled,
  setDemonstrationServiceStatus,
} from "./service-controls";

describe("OWC guarded demonstration service controls", () => {
  test("fails closed unless identity and reset controls are explicitly demonstration-enabled", () => {
    expect(
      isDemonstrationServiceControlEnabled({ identityMode: "production", resetEnabled: "true" }),
    ).toBe(false);
    expect(
      isDemonstrationServiceControlEnabled({ identityMode: "demonstration", resetEnabled: "false" }),
    ).toBe(false);
    expect(
      isDemonstrationServiceControlEnabled({ identityMode: "demonstration", resetEnabled: "true" }),
    ).toBe(true);
  });

  test("changes only sandbox service state and reports a non-production result", () => {
    resetSandboxServiceStatuses();
    const result = setDemonstrationServiceStatus(
      "nid",
      "offline",
      { identityMode: "demonstration", resetEnabled: "true" },
    );
    expect(result).toEqual({
      environment: "DEMONSTRATION",
      service: "nid",
      status: "offline",
      synthetic: true,
      productionConnected: false,
    });
    expect(getSandboxServiceStatus("nid")).toBe("offline");
    resetSandboxServiceStatuses();
  });

  test("throws when service controls are not demonstration-enabled", () => {
    expect(() =>
      setDemonstrationServiceStatus(
        "bank",
        "offline",
        { identityMode: "production", resetEnabled: "true" },
      ),
    ).toThrow("demonstration service controls are disabled");
  });
});
