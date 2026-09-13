import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const script = readFileSync(
  join(process.cwd(), "deploy", "monitor-check.sh"),
  "utf8",
);

describe("OWC production host monitoring contract", () => {
  test("checks application process, health and disk without projecting environment secrets", () => {
    expect(script).toContain("set -euo pipefail");
    expect(script).toContain("pm2 pid");
    expect(script).toContain("/api/health");
    expect(script).toContain("df -P");
    expect(script).toContain("OWC_DISK_WARNING_PERCENT");
    expect(script).not.toContain("printenv");
    expect(script).not.toContain("env | ");
  });

  test("supports an optional public HTTPS smoke URL without requiring it for local host health", () => {
    expect(script).toContain("OWC_PUBLIC_HEALTH_URL");
    expect(script).toContain("http://127.0.0.1:3000/api/health");
  });
});
