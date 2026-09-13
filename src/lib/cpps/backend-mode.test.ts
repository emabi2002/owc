import { describe, expect, test } from "bun:test";
import { selectCppsBackend } from "./backend-mode";

describe("CPPS backend selection", () => {
  test("always prefers an explicitly configured live CPPS", () => {
    expect(
      selectCppsBackend({ liveConfigured: true, referenceEnabled: true }),
    ).toBe("live");
  });

  test("uses the reference CPPS only when live CPPS is absent and reference mode is explicitly enabled", () => {
    expect(
      selectCppsBackend({ liveConfigured: false, referenceEnabled: true }),
    ).toBe("reference");
  });

  test("fails closed instead of silently inventing mock CPPS data when neither backend is available", () => {
    expect(
      selectCppsBackend({ liveConfigured: false, referenceEnabled: false }),
    ).toBe("unavailable");
  });
});
