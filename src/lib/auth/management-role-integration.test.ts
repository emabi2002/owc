import { describe, expect, test } from "bun:test";

async function read(path: string): Promise<string> {
  return Bun.file(path).text();
}

describe("management role integration", () => {
  test("fresh database schema declares the management role", async () => {
    const schema = await read("src/lib/db/schema.sql");
    expect(schema).toContain("'management'");
  });

  test("staff data mapping knows assessment, finance and management roles", async () => {
    const cms = await read("src/lib/data/cms.ts");
    expect(cms).toContain('assessment_officer: "Assessment Officer"');
    expect(cms).toContain('finance_officer: "Finance / Payment Officer"');
    expect(cms).toContain('management: "Management / Executive"');
  });

  test("seed role catalogue exposes management reporting without operational mutation wording", async () => {
    const seed = await read("src/lib/db/seed.ts");
    expect(seed).toContain('role: "Management / Executive"');
    expect(seed).toContain("View management reports");
    expect(seed).toContain("Use read-only AI analyst");
  });
});
