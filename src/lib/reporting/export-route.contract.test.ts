import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("OWC protected management report export contract", () => {
  test("export route authorizes reports.export before generating files", () => {
    const source = read("src/app/api/management/reports/export/route.ts");
    expect(source).toContain('hasPermission(user.role, "reports.export")');
    expect(source).toContain("serializeReportCsv");
    expect(source).toContain("serializeReportSpreadsheet");
    expect(source).toContain('event: "export"');
  });

  test("export route remains read-only and does not mutate claim records", () => {
    const source = read("src/app/api/management/reports/export/route.ts");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".delete(");
    expect(source).not.toContain("payments.manage");
  });

  test("management report page exposes print CSV and Excel actions", () => {
    const source = read("src/components/management/report-export-actions.tsx");
    expect(source).toContain("Print / Save PDF");
    expect(source).toContain("CSV");
    expect(source).toContain("Excel");
    expect(source).toContain("/api/management/reports/export");
  });
});
