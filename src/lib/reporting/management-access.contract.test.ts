import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("OWC protected management portal contract", () => {
  test("provides a dedicated management login page", () => {
    const source = read("src/app/management/login/page.tsx");
    expect(source).toContain("Management / Executive");
    expect(source).toContain("/api/admin/login");
    expect(source).toContain("/api/admin/mfa");
  });

  test("protects the management portal server-side with reporting permission", () => {
    const source = read("src/app/management/(portal)/layout.tsx");
    expect(source).toContain('requirePermission("reports.view"');
    expect(source).toContain("ManagementShell");
  });

  test("management login only accepts safe management redirects", () => {
    const source = read("src/app/management/login/page.tsx");
    expect(source).toContain('target.startsWith("/management")');
    expect(source).toContain('return "/management"');
  });

  test("management report page uses the protected reporting source rather than direct database mutation", () => {
    const source = read("src/app/management/(portal)/reports/page.tsx");
    expect(source).toContain("loadManagementReportingSource");
    expect(source).toContain("buildManagementReport");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".delete(");
  });
});
