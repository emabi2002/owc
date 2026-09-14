import { describe, expect, test } from "bun:test";
import {
  authenticateDemoPrincipal,
  issueDemoMfaToken,
  issueDemoSessionToken,
  listDemoPrincipals,
  listDemoStaffPrincipals,
  verifyDemoMfaCode,
  verifyDemoMfaToken,
  verifyDemoSessionToken,
} from "@/lib/auth/demo-identity";
import { getIdentityMode } from "@/lib/auth/identity-mode";
import { hasPermission } from "@/lib/auth/roles";

const SESSION_SECRET = "task-1-test-session-secret-at-least-32-characters";
const DEMO_SECRET = "OWC-Demo-Test-Password";

describe("OWC demonstration identity provider", () => {
  test("contains eight principals but only six staff-console identities", () => {
    expect(listDemoPrincipals()).toHaveLength(8);
    expect(listDemoStaffPrincipals()).toHaveLength(6);
    expect(
      listDemoPrincipals().filter((principal) => principal.principalType !== "staff"),
    ).toHaveLength(2);
    expect(
      listDemoPrincipals()
        .filter((principal) => principal.principalType !== "staff")
        .every((principal) => principal.role === null),
    ).toBe(true);
  });

  test("requires an explicitly configured demonstration identity mode", () => {
    expect(getIdentityMode("demonstration")).toBe("demonstration");
    expect(getIdentityMode("live")).toBe("live");
    expect(getIdentityMode(undefined)).toBe("live");
    expect(getIdentityMode("anything-else")).toBe("live");
  });

  test("authenticates only the correct server-side demonstration credential", () => {
    expect(
      authenticateDemoPrincipal(
        "claims.demo@owc.gov.pg",
        DEMO_SECRET,
        DEMO_SECRET,
      )?.personaId,
    ).toBe("claims-officer");
    expect(
      authenticateDemoPrincipal(
        "claims.demo@owc.gov.pg",
        "incorrect",
        DEMO_SECRET,
      ),
    ).toBeNull();
    expect(
      authenticateDemoPrincipal(
        "unknown@owc.gov.pg",
        DEMO_SECRET,
        DEMO_SECRET,
      ),
    ).toBeNull();
  });

  test("requires the configured six-digit MFA value", () => {
    expect(verifyDemoMfaCode("482913", "482913")).toBe(true);
    expect(verifyDemoMfaCode("482914", "482913")).toBe(false);
    expect(verifyDemoMfaCode("123", "123")).toBe(false);
  });

  test("issues signed MFA and session tokens that reject tampering and expiry", () => {
    const principal = listDemoStaffPrincipals()[0]!;
    const now = Date.UTC(2026, 8, 14, 10, 0, 0);

    const mfaToken = issueDemoMfaToken(principal, SESSION_SECRET, now);
    expect(verifyDemoMfaToken(mfaToken, SESSION_SECRET, now + 60_000)?.id).toBe(
      principal.id,
    );
    expect(
      verifyDemoMfaToken(`${mfaToken}tampered`, SESSION_SECRET, now + 60_000),
    ).toBeNull();
    expect(
      verifyDemoMfaToken(mfaToken, SESSION_SECRET, now + 6 * 60_000),
    ).toBeNull();

    const sessionToken = issueDemoSessionToken(principal, SESSION_SECRET, now);
    expect(
      verifyDemoSessionToken(sessionToken, SESSION_SECRET, now + 60_000)?.id,
    ).toBe(principal.id);
    expect(
      verifyDemoSessionToken(sessionToken, SESSION_SECRET, now + 9 * 60 * 60_000),
    ).toBeNull();
  });

  test("enforces separation between claims, assessment, payment and management duties", () => {
    expect(hasPermission("claims_officer", "claims.manage")).toBe(true);
    expect(hasPermission("claims_officer", "claims.assess")).toBe(false);
    expect(hasPermission("claims_officer", "payments.manage")).toBe(false);

    expect(hasPermission("assessment_officer", "claims.view")).toBe(true);
    expect(hasPermission("assessment_officer", "claims.assess")).toBe(true);
    expect(hasPermission("assessment_officer", "claims.manage")).toBe(false);
    expect(hasPermission("assessment_officer", "payments.manage")).toBe(false);

    expect(hasPermission("finance_officer", "claims.view")).toBe(true);
    expect(hasPermission("finance_officer", "payments.manage")).toBe(true);
    expect(hasPermission("finance_officer", "claims.manage")).toBe(false);
    expect(hasPermission("finance_officer", "claims.assess")).toBe(false);

    expect(hasPermission("management", "reports.view")).toBe(true);
    expect(hasPermission("management", "reports.ai.query")).toBe(true);
    expect(hasPermission("management", "claims.manage")).toBe(false);
    expect(hasPermission("management", "claims.assess")).toBe(false);
    expect(hasPermission("management", "payments.manage")).toBe(false);
  });
});
