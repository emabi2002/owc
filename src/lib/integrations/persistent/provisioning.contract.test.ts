import { describe, expect, test } from "bun:test";

describe("persistent demonstration provisioning contract", () => {
  test("provides a credential-safe read-only verification command", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.scripts["db:verify-demonstration"])
      .toBe("bun scripts/supabase/verify-persistent-demonstration.ts");

    const source = await Bun.file("scripts/supabase/verify-persistent-demonstration.ts").text();
    expect(source).toContain("createPersistentIntegrationRepository");
    expect(source).toContain("listBuckets");
    expect(source).toContain("owc_demo_verification_summary");
    expect(source).toContain("OWC-S05");
    expect(source).not.toContain("SUPABASE_SECRET_KEY=");
    expect(source).not.toContain("console.log(process.env");
    expect(source).not.toContain("processPayment");
  });

  test("documents application, verification, safety and rollback", async () => {
    const doc = (await Bun.file("docs/operations/persistent-demonstration-database.md").text()).toLowerCase();
    for (const term of [
      "postgres", "sql editor", "owc_persistent_demonstration", "owc_enable_sandbox",
      "service_role", "synthetic", "no real money", "rollback", "db:verify-demonstration",
    ]) expect(doc).toContain(term);
    expect(doc).toContain("20260922155151_persistent_multi_agency_demonstration.sql");
  });
});
