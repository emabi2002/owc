import { describe, expect, test } from "bun:test";

describe("current Supabase key configuration", () => {
  test("uses publishable and secret key names with legacy compatibility", async () => {
    const env = await Bun.file("src/lib/env.ts").text();
    expect(env).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(env).toContain("SUPABASE_SECRET_KEY");
    expect(env).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(env).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("never references the secret key from browser code", async () => {
    const browser = await Bun.file("src/lib/supabase/client.ts").text();
    expect(browser).not.toContain("SUPABASE_SECRET_KEY");
    expect(browser).not.toContain("supabaseSecretKey");
    expect(browser).toContain("supabasePublishableKey");
  });

  test("requires explicit persistent demonstration configuration", async () => {
    const env = await Bun.file("src/lib/env.ts").text();
    expect(env).toContain("OWC_PERSISTENT_DEMONSTRATION");
    expect(env).toContain("isPersistentDemonstrationConfigured");
  });
});
