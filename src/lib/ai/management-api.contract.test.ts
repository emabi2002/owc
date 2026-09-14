import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = () =>
  readFileSync(join(process.cwd(), "src/app/api/management/ai/route.ts"), "utf8");

describe("OWC protected management AI API contract", () => {
  test("requires authenticated reports.ai.query permission", () => {
    const text = source();
    expect(text).toContain("getSessionUser");
    expect(text).toContain('hasPermission(user.role, "reports.ai.query")');
    expect(text).toContain("status: 401");
    expect(text).toContain("status: 403");
  });

  test("validates bounded questions and uses the read-only analyst service", () => {
    const text = source();
    expect(text).toContain("questionSchema");
    expect(text).toContain("max(1000)");
    expect(text).toContain("analyzeManagementQuestion");
    expect(text).not.toContain(".insert(");
    expect(text).not.toContain(".update(");
    expect(text).not.toContain(".delete(");
  });

  test("records metadata-only analysis audit evidence", () => {
    const text = source();
    expect(text).toContain('entity: "management_ai_analysis"');
    expect(text).toContain("analysisId");
    expect(text).not.toContain("metadata: { question");
  });
});
