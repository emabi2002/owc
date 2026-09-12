import { describe, expect, test } from "bun:test";
import {
  bankAccountSchema,
  bankPaymentSchema,
  employerSchema,
  employmentSchema,
  insuranceSchema,
  ircSchema,
  medicalSchema,
  nidSchema,
  notificationSchema,
} from "./validation";

describe("sandbox API validation", () => {
  test("accepts the documented demo identifiers", () => {
    expect(nidSchema.safeParse({ nid: "NID-DEMO-0001" }).success).toBe(true);
    expect(employerSchema.safeParse({ registrationNo: "IPA-DEMO-1001" }).success).toBe(true);
    expect(ircSchema.safeParse({ tin: "TIN-DEMO-9001" }).success).toBe(true);
    expect(employmentSchema.safeParse({ employeeNo: "EMP-DEMO-001" }).success).toBe(true);
    expect(medicalSchema.safeParse({ certificateNo: "MED-DEMO-001" }).success).toBe(true);
    expect(insuranceSchema.safeParse({ policyNo: "POL-DEMO-001" }).success).toBe(true);
    expect(bankAccountSchema.safeParse({ accountReference: "BANK-DEMO-001" }).success).toBe(true);
  });

  test("rejects malformed payment requests", () => {
    const result = bankPaymentSchema.safeParse({
      idempotencyKey: "",
      claimReference: "OWC-DEMO-CLAIM-0001",
      accountReference: "BANK-DEMO-001",
      amountPgk: -1,
    });
    expect(result.success).toBe(false);
  });

  test("requires a supported notification channel", () => {
    expect(notificationSchema.safeParse({
      channel: "fax",
      recipient: "demo@example.invalid",
      event: "CLAIM_RECEIVED",
      message: "Demo notification",
    }).success).toBe(false);
  });
});
