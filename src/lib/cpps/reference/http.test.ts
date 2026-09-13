import { describe, expect, test } from "bun:test";
import {
  isReferenceCppsHttpEnabled,
  referenceCppsHealthPayload,
  referenceCppsUnavailableResponse,
} from "./http";

describe("reference CPPS HTTP safety boundary", () => {
  test("enables the reference façade only for the explicit true value", () => {
    expect(isReferenceCppsHttpEnabled("true")).toBe(true);
    expect(isReferenceCppsHttpEnabled("false")).toBe(false);
    expect(isReferenceCppsHttpEnabled(undefined)).toBe(false);
  });

  test("returns a non-disclosing 404 while reference mode is disabled", async () => {
    const response = referenceCppsUnavailableResponse();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });

  test("labels health as synthetic and non-durable", () => {
    expect(referenceCppsHealthPayload()).toEqual({
      source: "reference",
      service: "cpps",
      status: "available",
      durable: false,
      productionConnected: false,
    });
  });
});
