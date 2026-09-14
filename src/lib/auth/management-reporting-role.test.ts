import { describe, expect, test } from "bun:test";
import { listDemoStaffPrincipals } from "@/lib/auth/demo-identity";
import { ALL_ROLES, PERMISSIONS, ROLE_LABELS } from "@/lib/auth/roles";

describe("OWC management reporting role", () => {
  test("defines the canonical management role and display label", () => {
    expect(ALL_ROLES as string[]).toContain("management");
    expect((ROLE_LABELS as unknown as Record<string, string>).management).toBe(
      "Management / Executive",
    );
  });

  test("grants only the approved reporting permissions", () => {
    const permissions = PERMISSIONS as unknown as Record<string, readonly string[]>;

    expect(permissions["reports.view"]).toEqual(["management"]);
    expect(permissions["reports.export"]).toEqual(["management"]);
    expect(permissions["reports.ai.query"]).toEqual(["management"]);
    expect(permissions["reports.source_data.view"]).toEqual(["management"]);

    for (const permission of [
      "claims.manage",
      "claims.assess",
      "payments.manage",
      "users.manage",
      "settings.manage",
    ]) {
      expect(permissions[permission]).not.toContain("management");
    }
  });

  test("provides a management demonstration staff persona", () => {
    const management = listDemoStaffPrincipals().find(
      (principal) => String(principal.role) === "management",
    );

    expect(management).toBeDefined();
    expect(management?.principalType).toBe("staff");
    expect(management?.mfaRequired).toBe(true);
  });
});
