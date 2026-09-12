import { describe, expect, test } from "bun:test";
import { buildReadinessChecks } from "./readiness";

describe("OWC operational readiness model", () => {
  test("marks configured production dependencies ready", () => {
    const checks = buildReadinessChecks({
      supabase: true,
      drupal: true,
      cpps: true,
      malwareScanner: true,
      notificationGateway: true,
    });
    expect(checks.every((item) => item.status === "ready")).toBe(true);
  });

  test("identifies external dependencies still requiring configuration", () => {
    const checks = buildReadinessChecks({
      supabase: true,
      drupal: false,
      cpps: false,
      malwareScanner: true,
      notificationGateway: false,
    });
    expect(checks.filter((item) => item.status !== "ready").map((item) => item.key)).toEqual([
      "drupal",
      "cpps",
      "notificationGateway",
    ]);
  });
});
