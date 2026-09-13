import { describe, expect, test } from "bun:test";
import { buildProductionPreflight } from "./production-preflight";

const configured = {
  siteUrl: "https://owc.gov.pg",
  supabaseUrl: "https://owc-project.supabase.co",
  supabaseAnonKey: "public-anon-key",
  supabaseServiceRoleKey: "server-secret-service-role",
  contentSource: "drupal" as const,
  drupalBaseUrl: "https://cms.owc.gov.pg",
  evidenceUploadSigningSecret: "x".repeat(48),
  requireMalwareScan: true,
  malwareScanUrl: "https://scanner.internal.example/scan",
  notificationApiUrl: "https://notify.internal.example/send",
  captchaProvider: "turnstile" as const,
  captchaSiteKey: "public-site-key",
  captchaSecretKey: "server-captcha-secret",
  cppsApiBaseUrl: "https://cpps.internal.example/api",
};

describe("OWC production preflight", () => {
  test("separates repository/environment readiness from external CPPS verification", () => {
    const checks = buildProductionPreflight(configured);

    expect(checks.find((item) => item.key === "siteUrl")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "supabase")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "drupalAuthority")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "evidenceSecurity")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "malwareScan")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "notifications")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "captcha")?.status).toBe("ready");
    expect(checks.find((item) => item.key === "cpps")?.status).toBe(
      "external-verification-required",
    );
  });

  test("fails closed on missing production security configuration", () => {
    const checks = buildProductionPreflight({
      ...configured,
      siteUrl: "http://owc.gov.pg",
      supabaseServiceRoleKey: "",
      contentSource: "auto",
      evidenceUploadSigningSecret: "short",
      requireMalwareScan: false,
      malwareScanUrl: "",
      notificationApiUrl: "",
      captchaProvider: "fallback",
      captchaSiteKey: "",
      captchaSecretKey: "",
      cppsApiBaseUrl: "",
    });

    for (const key of [
      "siteUrl",
      "supabase",
      "drupalAuthority",
      "evidenceSecurity",
      "malwareScan",
      "notifications",
      "captcha",
      "cpps",
    ] as const) {
      expect(checks.find((item) => item.key === key)?.status).toBe("configuration-required");
    }
  });

  test("never projects secret values into the preflight report", () => {
    const serialized = JSON.stringify(buildProductionPreflight(configured));

    expect(serialized).not.toContain(configured.supabaseServiceRoleKey);
    expect(serialized).not.toContain(configured.evidenceUploadSigningSecret);
    expect(serialized).not.toContain(configured.captchaSecretKey);
  });
});
