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
import { clearIntegrationEvents, listIntegrationEvents } from "./events";

describe("OWC synthetic agency sandbox", () => {
  test("verifies the coherent reference claimant and employer", () => {
    expect(verifyIdentity("NID-00010001").data.matched).toBe(true);
    expect(verifyEmployer("IPA-2020-1001").data.active).toBe(true);
    expect(checkTaxCompliance("TIN-90010001").data.status).toBe("COMPLIANT");
    expect(verifyEmployment("EMP-0001001").data.employed).toBe(true);
    expect(verifyMedicalCertificate("MED-2026-00451").data.valid).toBe(true);
    expect(verifyInsurancePolicy("WC-POL-2026-01872").data.active).toBe(true);
    expect(verifyBankAccount("BANK-ACC-7842").data.verified).toBe(true);
  });

  test("returns an explicit not-found result for unknown identity", () => {
    const result = verifyIdentity("NID-00019999");
    expect(result.data.matched).toBe(false);
    expect(result.source).toBe("sandbox");
  });

  test("makes payment processing idempotent for the same request key", () => {
    const input = {
      idempotencyKey: "PAY-OWC-2026-005112",
      claimReference: "OWC-2026-005112",
      accountReference: "BANK-ACC-7842",
      amountPgk: 18450,
    };

    const first = processSandboxPayment(input);
    const second = processSandboxPayment(input);

    expect(first.data.status).toBe("PROCESSED");
    expect(second.data.transactionReference).toBe(first.data.transactionReference);
  });

  test("records safe integration telemetry for agency calls", () => {
    clearIntegrationEvents();
    verifyIdentity("NID-00010001");

    const events = listIntegrationEvents();
    expect(events).toHaveLength(1);
    expect(events[0].service).toBe("nid");
    expect(events[0].operation).toBe("verify_identity");
    expect(events[0].status).toBe("success");
    expect(events[0].source).toBe("sandbox");
  });

  test("records failed lookups as not-found rather than successful integrations", () => {
    clearIntegrationEvents();
    verifyIdentity("NID-00019999");

    expect(listIntegrationEvents()[0]).toMatchObject({
      service: "nid",
      operation: "verify_identity",
      status: "not_found",
    });
  });
});
