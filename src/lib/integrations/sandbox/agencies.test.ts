import { describe, expect, test } from "bun:test";
import {
  checkTaxCompliance,
  processSandboxPayment,
  verifyBankAccount,
  verifyEmployer,
  verifyEmployment,
  verifyIdentity,
  verifyInsurancePolicy,
  verifyMedicalCertificate,
} from "./agencies";

describe("OWC synthetic agency sandbox", () => {
  test("verifies the coherent demonstration claimant and employer", () => {
    expect(verifyIdentity("NID-DEMO-0001").data.matched).toBe(true);
    expect(verifyEmployer("IPA-DEMO-1001").data.active).toBe(true);
    expect(checkTaxCompliance("TIN-DEMO-9001").data.status).toBe("COMPLIANT");
    expect(verifyEmployment("EMP-DEMO-001").data.employed).toBe(true);
    expect(verifyMedicalCertificate("MED-DEMO-001").data.valid).toBe(true);
    expect(verifyInsurancePolicy("POL-DEMO-001").data.active).toBe(true);
    expect(verifyBankAccount("BANK-DEMO-001").data.verified).toBe(true);
  });

  test("returns an explicit not-found result for unknown identity", () => {
    const result = verifyIdentity("NID-DEMO-MISSING");
    expect(result.data.matched).toBe(false);
    expect(result.source).toBe("sandbox");
  });

  test("makes payment processing idempotent for the same request key", () => {
    const input = {
      idempotencyKey: "PAY-DEMO-OWC-0001",
      claimReference: "OWC-DEMO-CLAIM-0001",
      accountReference: "BANK-DEMO-001",
      amountPgk: 18450,
    };

    const first = processSandboxPayment(input);
    const second = processSandboxPayment(input);

    expect(first.data.status).toBe("PROCESSED");
    expect(second.data.transactionReference).toBe(first.data.transactionReference);
  });
});
