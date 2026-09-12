import { describe, expect, test } from "bun:test";
import { validateIntegrationCoherence } from "./coherence";

describe("cross-agency record coherence", () => {
  const coherent = {
    nid: "NID-00010001",
    identityName: "Mara Kila",
    employerRegistrationNo: "IPA-2020-1001",
    taxpayerRegistrationNo: "IPA-2020-1001",
    employmentNid: "NID-00010001",
    employmentEmployerRegistrationNo: "IPA-2020-1001",
    medicalPatientNid: "NID-00010001",
    insuranceEmployerRegistrationNo: "IPA-2020-1001",
    bankAccountName: "Mara Kila",
  };

  test("accepts a coherent worker and employer record chain", () => {
    expect(validateIntegrationCoherence(coherent)).toEqual({ ok: true });
  });

  test("rejects an employment record belonging to a different identity", () => {
    const result = validateIntegrationCoherence({
      ...coherent,
      employmentNid: "NID-00010002",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("employment identity");
  });

  test("rejects a bank account name that does not match the verified worker", () => {
    const result = validateIntegrationCoherence({
      ...coherent,
      bankAccountName: "Different Worker",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("bank account");
  });
});
