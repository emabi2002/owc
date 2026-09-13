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
      evidenceRepository: true,
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
      evidenceRepository: true,
    });
    expect(checks.filter((item) => item.status !== "ready").map((item) => item.key)).toEqual([
      "drupal",
      "cpps",
      "notificationGateway",
    ]);
  });

  test("blocks production evidence readiness when the secure repository policy is incomplete", () => {
    const checks = buildReadinessChecks({
      supabase: true,
      drupal: true,
      cpps: true,
      malwareScanner: true,
      notificationGateway: true,
      evidenceRepository: false,
    });

    expect(checks.find((item) => item.key === "evidenceRepository")).toMatchObject({
      status: "configuration-required",
    });
  });
});
