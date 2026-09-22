import { describe, expect, test } from "bun:test";
import {
  PersistentIntegrationError,
  createPersistentIntegrationRepository,
} from "./repository";
import type { PersistentRpcClient, RpcResult } from "./types";

function clientWith(
  responder: (fn: string, params: Record<string, unknown>) => RpcResult,
) {
  const calls: Array<{ fn: string; params: Record<string, unknown> }> = [];
  const client: PersistentRpcClient = {
    async rpc(fn, params = {}) {
      calls.push({ fn, params });
      return responder(fn, params);
    },
  };
  return { client, calls };
}

const envelope = (data: Record<string, unknown>) => ({
  source: "persistent_demo",
  service: "nid",
  operation: "verify_identity",
  correlationId: "OWC-DEMO-TEST",
  timestamp: "2026-09-22T00:00:00.000Z",
  data,
});

describe("persistent integration repository", () => {
  test("normalizes lookup identifiers before calling the narrow RPC", async () => {
    const fake = clientWith(() => ({ data: envelope({ matched: true }), error: null }));
    const repository = createPersistentIntegrationRepository(fake.client);

    await repository.lookup("nid", "  nid-00010001  ");

    expect(fake.calls).toEqual([{
      fn: "owc_demo_lookup",
      params: { p_service: "nid", p_identifier: "NID-00010001" },
    }]);
  });

  test("preserves a bounded not-found response", async () => {
    const response = envelope({ matched: false, nid: "NID-UNKNOWN" });
    const fake = clientWith(() => ({ data: response, error: null }));

    expect(await createPersistentIntegrationRepository(fake.client).lookup("nid", "nid-unknown"))
      .toEqual(response);
  });

  test("passes payment idempotency and returns the original duplicate transaction", async () => {
    const response = envelope({
      transactionReference: "SIM-PAY-2026-ABC",
      duplicateRequest: true,
      simulation: true,
      moneyMovement: false,
    });
    const fake = clientWith(() => ({ data: response, error: null }));
    const result = await createPersistentIntegrationRepository(fake.client).processPayment({
      idempotencyKey: "idem-1",
      claimReference: "owc-2026-005112",
      accountReference: "bank-acc-7842",
      amountPgk: 8400,
    });

    expect(result).toEqual(response);
    expect(fake.calls[0]).toEqual({
      fn: "owc_demo_process_payment",
      params: {
        p_idempotency_key: "idem-1",
        p_claim_reference: "OWC-2026-005112",
        p_account_reference: "BANK-ACC-7842",
        p_amount_pgk: 8400,
      },
    });
  });

  test("maps unavailable services to a safe error without database details", async () => {
    const fake = clientWith(() => ({
      data: null,
      error: {
        message: "relation nid_registry.persons does not exist; password=secret",
        code: "42P01",
      },
    }));

    try {
      await createPersistentIntegrationRepository(fake.client).lookup("nid", "NID-1");
      throw new Error("expected lookup to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(PersistentIntegrationError);
      expect((error as Error).message).toBe("Persistent demonstration service unavailable");
      expect(JSON.stringify(error)).not.toContain("nid_registry");
      expect(JSON.stringify(error)).not.toContain("password");
    }
  });

  test("rejects malformed RPC responses", async () => {
    const fake = clientWith(() => ({ data: { unexpected: true }, error: null }));
    expect(createPersistentIntegrationRepository(fake.client).lookup("nid", "NID-1"))
      .rejects.toThrow("Persistent demonstration returned an invalid response");
  });
});
