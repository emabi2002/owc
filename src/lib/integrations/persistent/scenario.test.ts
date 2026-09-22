import { describe, expect, test } from "bun:test";
import { runPersistentWorkerClaimDemo, type PersistentScenarioGateway } from "./scenario";

const records = {
  nid: { matched: true, nid: "NID-00010001", firstName: "Mara", surname: "Kila" },
  ipa: { active: true, registrationNo: "IPA-2020-1001" },
  irc: { found: true, status: "COMPLIANT", registrationNo: "IPA-2020-1001" },
  employer: { employed: true, nid: "NID-00010001", employerRegistrationNo: "IPA-2020-1001" },
  medical: { valid: true, patientNid: "NID-00010001" },
  insurance: { active: true, employerRegistrationNo: "IPA-2020-1001" },
  bank: { verified: true, accountName: "Mara Kila" },
} as const;

function gateway(overrides: Partial<Record<keyof typeof records, Record<string, unknown>>> = {}) {
  const calls: string[] = [];
  const integration: PersistentScenarioGateway = {
    async lookup(service, identifier) {
      calls.push(`${service}:${identifier}`);
      return {
        source: "persistent_demo",
        service,
        operation: "verify",
        correlationId: `DB-${service.toUpperCase()}`,
        timestamp: "2026-09-22T00:00:00.000Z",
        data: { ...records[service], ...overrides[service] },
      };
    },
    async processPayment(input) {
      calls.push(`payment:${input.idempotencyKey}`);
      return {
        source: "persistent_demo", service: "bank", operation: "process_payment",
        correlationId: "DB-PAYMENT", timestamp: "2026-09-22T00:00:00.000Z",
        data: { transactionReference: "SIM-PAY-PERSISTENT", duplicateRequest: calls.filter((c) => c.startsWith("payment:")).length > 1 },
      };
    },
    async sendNotification() {
      calls.push("notification");
      return {
        source: "persistent_demo", service: "notifications", operation: "send_notification",
        correlationId: "DB-NOTIFICATION", timestamp: "2026-09-22T00:00:00.000Z",
        data: { accepted: true },
      };
    },
  };
  return { integration, calls };
}

describe("persistent worker claim demonstration", () => {
  test("runs every agency check in order and uses persisted correlation IDs", async () => {
    const fake = gateway();
    const result = await runPersistentWorkerClaimDemo({}, fake.integration);
    expect(result.status).toBe("completed");
    expect(result.paymentTransactionReference).toBe("SIM-PAY-PERSISTENT");
    expect(fake.calls.map((call) => call.split(":")[0])).toEqual([
      "nid", "ipa", "irc", "employer", "medical", "insurance", "bank", "payment", "notification",
    ]);
    expect(result.steps.find((step) => step.key === "identity")?.correlationId).toBe("DB-NID");
  });

  test("stops before downstream checks when identity is not found", async () => {
    const fake = gateway({ nid: { matched: false } });
    const result = await runPersistentWorkerClaimDemo({}, fake.integration);
    expect(result.status).toBe("stopped");
    expect(fake.calls).toHaveLength(1);
  });

  test("stops mismatched records before determination and payment", async () => {
    const fake = gateway({ employer: { nid: "NID-OTHER" } });
    const result = await runPersistentWorkerClaimDemo({}, fake.integration);
    expect(result.status).toBe("stopped");
    expect(result.steps.at(-1)?.key).toBe("record_reconciliation");
    expect(fake.calls.some((call) => call.startsWith("payment:"))).toBe(false);
  });

  test("uses a stable payment idempotency key across repeated runs", async () => {
    const fake = gateway();
    const first = await runPersistentWorkerClaimDemo({}, fake.integration);
    const second = await runPersistentWorkerClaimDemo({}, fake.integration);
    expect(first.paymentTransactionReference).toBe(second.paymentTransactionReference);
    expect(fake.calls.filter((call) => call === "payment:PAY-OWC-2026-005112")).toHaveLength(2);
  });
});
