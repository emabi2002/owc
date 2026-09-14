import { describe, expect, test } from "bun:test";
import { isDemoIdentityConfigured } from "@/lib/auth/demo-identity";

async function read(path: string): Promise<string> {
  return Bun.file(path).text();
}

describe("OWC demonstration identity hardening", () => {
  test("fails readiness when any required demonstration secret is missing or malformed", () => {
    expect(
      isDemoIdentityConfigured({
        sessionSecret: "12345678901234567890123456789012",
        credential: "Demo-Password",
        mfaCode: "482913",
      }),
    ).toBe(true);
    expect(
      isDemoIdentityConfigured({
        sessionSecret: "short",
        credential: "Demo-Password",
        mfaCode: "482913",
      }),
    ).toBe(false);
    expect(
      isDemoIdentityConfigured({
        sessionSecret: "12345678901234567890123456789012",
        credential: "",
        mfaCode: "482913",
      }),
    ).toBe(false);
    expect(
      isDemoIdentityConfigured({
        sessionSecret: "12345678901234567890123456789012",
        credential: "Demo-Password",
        mfaCode: "123",
      }),
    ).toBe(false);
  });

  test("auth routes check demo readiness before issuing tokens", async () => {
    const login = await read("src/app/api/admin/login/route.ts");
    const mfa = await read("src/app/api/admin/mfa/route.ts");
    expect(login).toContain("isDemoIdentityConfigured");
    expect(mfa).toContain("isDemoIdentityConfigured");
  });

  test("fresh and upgraded databases grant assessment and finance claim visibility", async () => {
    const schema = await read("src/lib/db/schema.sql");
    const migration = await read(
      "src/lib/db/demonstration-identity-roles-2026-09-14.sql",
    );

    expect(schema).toContain("'assessment_officer'");
    expect(schema).toContain("'finance_officer'");
    expect(schema).toContain(
      "in ('administrator','claims_officer','reviewer','assessment_officer','finance_officer')",
    );

    expect(migration).toContain("add value if not exists 'assessment_officer'");
    expect(migration).toContain("add value if not exists 'finance_officer'");
    expect(migration).toContain("claims_staff_read");
    expect(migration).toContain("assessment_officer");
    expect(migration).toContain("finance_officer");
  });

  test("fresh and upgraded databases define management without claim mutation authority", async () => {
    const schema = await read("src/lib/db/schema.sql");
    const migration = await read(
      "src/lib/db/management-reporting-role-2026-09-14.sql",
    );

    expect(schema).toContain("'management'");
    expect(migration).toContain("add value if not exists 'management'");
    expect(migration).not.toContain("claims_staff_manage");
    expect(migration).not.toContain("payments.manage");
  });
});