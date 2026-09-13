import { describe, expect, test } from "bun:test";
import {
  isSandboxEnabled,
  sandboxServiceUnavailableResponse,
  sandboxUnavailableResponse,
} from "./http";

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

  test("returns an explicit sandbox 503 when one simulated service is offline", async () => {
    const response = sandboxServiceUnavailableResponse("nid");
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      source: "sandbox",
      service: "nid",
      status: "unavailable",
    });
  });
});
