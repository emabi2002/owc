import { describe, expect, test } from "bun:test";
import { makeSandboxEnvelope } from "./service";

describe("sandbox response envelope", () => {
  test("identifies the response as sandbox data with trace metadata", () => {
    const result = makeSandboxEnvelope("nid", "verify_identity", { matched: true });

    expect(result.source).toBe("sandbox");
    expect(result.service).toBe("nid");
    expect(result.operation).toBe("verify_identity");
    expect(result.correlationId).toMatch(/^OWC-DEMO-[A-Z0-9-]+$/);
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    expect(result.data).toEqual({ matched: true });
  });
});
