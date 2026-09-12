import { describe, expect, test } from "bun:test";
import { isSandboxEnabled, sandboxUnavailableResponse } from "./http";

describe("sandbox HTTP safety boundary", () => {
  test("enables sandbox only for the explicit true value", () => {
    expect(isSandboxEnabled("true")).toBe(true);
    expect(isSandboxEnabled("TRUE")).toBe(false);
    expect(isSandboxEnabled("1")).toBe(false);
    expect(isSandboxEnabled(undefined)).toBe(false);
  });

  test("returns a non-disclosing 404 response when sandbox is disabled", async () => {
    const response = sandboxUnavailableResponse();
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });
});
