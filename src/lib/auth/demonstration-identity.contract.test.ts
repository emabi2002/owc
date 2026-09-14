import { describe, expect, test } from "bun:test";

async function read(path: string): Promise<string> {
  return Bun.file(path).text();
}

describe("OWC demonstration identity contract", () => {
  test("provides an explicit demonstration identity provider with eight personas", async () => {
    const path = "src/lib/auth/demo-identity.ts";
    expect(await Bun.file(path).exists()).toBe(true);
    const source = await read(path);
    for (const marker of [
      "administrator",
      "claims-officer",
      "assessment-officer",
      "finance-officer",
      "content-editor",
      "management-executive",
      "employer-representative",
      "claimant-worker",
    ]) {
      expect(source).toContain(marker);
    }
  });

  test("models assessment, finance and management as first-class separated roles", async () => {
    const roles = await read("src/lib/auth/roles.ts");
    const types = await read("src/lib/supabase/types.ts");
    expect(roles).toContain('"assessment_officer"');
    expect(roles).toContain('"finance_officer"');
    expect(roles).toContain('"management"');
    expect(roles).toContain('"claims.assess"');
    expect(roles).toContain('"payments.manage"');
    expect(roles).toContain('"reports.view"');
    expect(roles).toContain('"reports.ai.query"');
    expect(types).toContain('| "assessment_officer"');
    expect(types).toContain('| "finance_officer"');
    expect(types).toContain('| "management"');
  });

  test("selects demonstration identity explicitly and never from missing Supabase configuration", async () => {
    const path = "src/lib/auth/identity-mode.ts";
    expect(await Bun.file(path).exists()).toBe(true);
    const mode = await read(path);
    const session = await read("src/lib/auth/session.ts");
    expect(mode).toContain('"demonstration"');
    expect(mode).toContain('"live"');
    expect(mode).toContain("OWC_IDENTITY_MODE");
    expect(session).not.toContain("if (!isSupabaseConfigured) return DEMO_USER");
  });

  test("uses signed demonstration sessions and MFA without exposing credentials to the browser", async () => {
    const source = await read("src/lib/auth/demo-identity.ts");
    expect(source).toContain("createHmac");
    expect(source).toContain("timingSafeEqual");
    expect(source).toContain("OWC_DEMO_SESSION_SECRET");
    expect(source).toContain("OWC_DEMO_PASSWORD");
    expect(source).toContain("OWC_DEMO_MFA_CODE");
    expect(source).not.toContain("password:");
  });

  test("routes staff authentication through the selected provider and identifies the demo environment", async () => {
    const loginRoute = await read("src/app/api/admin/login/route.ts");
    const mfaRoute = await read("src/app/api/admin/mfa/route.ts");
    const loginPage = await read("src/app/admin/login/page.tsx");
    expect(loginRoute).toContain("isDemonstrationIdentityMode");
    expect(mfaRoute).toContain("isDemonstrationIdentityMode");
    expect(loginPage).toContain("OWC Demonstration Environment");
  });

  test("documents configurable demo identity secrets and post-award live migration", async () => {
    const env = await read(".env.example");
    expect(env).toContain("OWC_IDENTITY_MODE=live");
    expect(env).toContain("OWC_DEMO_SESSION_SECRET=");
    expect(env).toContain("OWC_DEMO_PASSWORD=");
    expect(env).toContain("OWC_DEMO_MFA_CODE=");
    expect(await Bun.file("docs/operations/demonstration-identity.md").exists()).toBe(true);
  });
});