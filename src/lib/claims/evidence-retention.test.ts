import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(join(process.cwd(), "src/lib/db/claims-evidence.sql"), "utf8");

describe("claim evidence retention and scan governance", () => {
  test("persists retention, legal-hold and scanner state metadata", () => {
    expect(sql).toContain("retention_until");
    expect(sql).toContain("legal_hold");
    expect(sql).toContain("security_scan_status");
    expect(sql).toContain("'clean','infected','unavailable','not_configured'");
  });

  test("indexes evidence due for retention review without bypassing legal hold", () => {
    expect(sql).toContain("claim_evidence_retention_idx");
    expect(sql).toContain("retention_until");
    expect(sql).toContain("legal_hold");
  });
});
