import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("OWC management AI analyst workspace contract", () => {
  test("provides a protected management analyst page and read-only notice", () => {
    const page = read("src/app/management/(portal)/analyst/page.tsx");
    expect(page).toContain('requirePermission("reports.ai.query"');
    expect(page).toContain("ManagementAiPanel");
    expect(page).toContain("Read-only");
  });

  test("provides free-text analysis with examples, authoritative results and standard-report fallback", () => {
    const panel = read("src/components/management/management-ai-panel.tsx");
    expect(panel).toContain("/api/management/ai");
    expect(panel).toContain("Ask a management question");
    expect(panel).toContain("Example questions");
    expect(panel).toContain("analysisId");
    expect(panel).toContain("recordCount");
    expect(panel).toContain("/management/reports");
    expect(panel).not.toContain(".insert(");
    expect(panel).not.toContain(".update(");
    expect(panel).not.toContain(".delete(");
  });

  test("navigation links management users to the analyst workspace", () => {
    const shell = read("src/components/management/management-shell.tsx");
    const reports = read("src/app/management/(portal)/reports/page.tsx");
    expect(shell).toContain('href="/management/analyst"');
    expect(reports).toContain('href="/management/analyst"');
  });
});
