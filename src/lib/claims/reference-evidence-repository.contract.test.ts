import { describe, expect, test } from "bun:test";

async function read(path: string): Promise<string> {
  return Bun.file(path).text();
}

async function exists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

describe("OWC reference evidence repository contract", () => {
  test("is an explicitly enabled reference adapter rather than an implicit storage fallback", async () => {
    expect(await exists("src/lib/claims/reference-evidence-repository.ts")).toBe(true);
    const env = await read("src/lib/env.ts");
    const example = await read(".env.example");
    expect(env).toContain("OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY");
    expect(example).toContain('OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY="false"');
    expect(env).toContain("enableReferenceEvidenceRepository");
  });

  test("labels the adapter as reference, non-production and non-durable", async () => {
    const source = await read("src/lib/claims/reference-evidence-repository.ts");
    expect(source).toContain('source: "reference"');
    expect(source).toContain("productionConnected: false");
    expect(source).toContain("durable: false");
  });

  test("reuses evidence validation, integrity, scan and review controls", async () => {
    const source = await read("src/lib/claims/reference-evidence-repository.ts");
    expect(source).toContain("validateEvidenceFile");
    expect(source).toContain("buildEvidenceStoragePath");
    expect(source).toContain("sha256Hex");
    expect(source).toContain("shouldBlockEvidenceUpload");
    expect(source).toContain("buildEvidenceReviewUpdate");
  });

  test("adds evidence RBAC with assessment read-only and no finance/editor blanket access", async () => {
    const roles = await read("src/lib/auth/roles.ts");
    expect(roles).toContain('"evidence.view"');
    expect(roles).toContain('"evidence.manage"');

    const viewLine = roles
      .split("\n")
      .find((line) => line.includes('"evidence.view"')) ?? "";
    const manageLine = roles
      .split("\n")
      .find((line) => line.includes('"evidence.manage"')) ?? "";

    expect(viewLine).toContain("assessment_officer");
    expect(viewLine).not.toContain("finance_officer");
    expect(viewLine).not.toContain("editor");
    expect(manageLine).toContain("claims_officer");
    expect(manageLine).not.toContain("assessment_officer");
    expect(manageLine).not.toContain("finance_officer");
  });

  test("provides disabled-by-default reference HTTP routes without arbitrary path access", async () => {
    const health = "src/app/api/reference/evidence/health/route.ts";
    const claim = "src/app/api/reference/evidence/claims/[ref]/route.ts";
    const object = "src/app/api/reference/evidence/claims/[ref]/[objectId]/route.ts";
    expect(await exists(health)).toBe(true);
    expect(await exists(claim)).toBe(true);
    expect(await exists(object)).toBe(true);

    for (const path of [health, claim, object]) {
      const source = await read(path);
      expect(source).toContain("isReferenceEvidenceRepositoryEnabled");
      expect(source).toContain("404");
      expect(source).not.toContain("readFile(");
      expect(source).not.toContain("readFileSync(");
    }
  });

  test("documents demonstration limitations and production migration boundary", async () => {
    const path = "docs/operations/reference-evidence-repository.md";
    expect(await exists(path)).toBe(true);
    const doc = await read(path);
    expect(doc.toLowerCase()).toContain("reference");
    expect(doc.toLowerCase()).toContain("non-durable");
    expect(doc.toLowerCase()).toContain("production");
    expect(doc.toLowerCase()).toContain("legal hold");
    expect(doc).toContain("OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY");
  });
});
