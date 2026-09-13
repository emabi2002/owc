import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("OWC reference end-to-end UAT contract", () => {
  test("reference suite defines all seven required scenarios and an explicit synthetic mode", () => {
    const source = read("src/lib/uat/reference-suite.ts");

    for (let index = 1; index <= 7; index += 1) {
      expect(source).toContain(`REF-UAT-00${index}`);
    }
    expect(source).toContain("REFERENCE/SANDBOX");
    expect(source).toContain("productionAcceptance: false");
    expect(source).toContain("syntheticData: true");
  });

  test("happy-path evidence composes the existing 12-step worker claim journey", () => {
    const source = read("src/lib/uat/reference-suite.ts");

    expect(source).toContain("runWorkerClaimDemo");
    for (const step of [
      "claim_registration",
      "identity",
      "employer_registry",
      "tax_compliance",
      "employment",
      "medical",
      "insurance",
      "bank_account",
      "record_reconciliation",
      "determination",
      "payment",
      "notification",
    ]) {
      expect(source).toContain(step);
    }
  });

  test("suite covers negative coherence, idempotency, reference CPPS lifecycle and explicit backend selection", () => {
    const source = read("src/lib/uat/reference-suite.ts");

    expect(source).toContain("createReferenceCppsService");
    expect(source).toContain("recordSyntheticPayment");
    expect(source).toContain("realFundsMoved");
    expect(source).toContain("selectCppsBackend");
    expect(source).toContain('"unavailable"');
    expect(source).toContain("payment idempotency");
    expect(source).toContain("record mismatch");
    expect(source).toContain("invalid transition");
  });

  test("evidence CLI writes JSON, resolves a release SHA and fails closed on a failed suite", () => {
    const script = read("scripts/uat/run-reference-suite.ts");
    const pkg = read("package.json");

    expect(pkg).toContain('"uat:reference"');
    expect(script).toContain("OWC_UAT_EVIDENCE_PATH");
    expect(script).toContain("GITHUB_SHA");
    expect(script).toContain("git rev-parse HEAD");
    expect(script).toContain("JSON.stringify");
    expect(script).toContain("process.exitCode = 1");
  });

  test("UAT documentation removes silent mock expectations and separates reference from live acceptance", () => {
    const checklist = read("docs/UAT_CHECKLIST.md");
    const plan = read("docs/uat/reference-uat-plan.md");
    const evidence = read("docs/uat/uat-evidence-template.md");
    const acceptance = read("docs/uat/production-uat-acceptance.md");
    const combined = [checklist, plan, evidence, acceptance].join("\n");

    expect(checklist).not.toContain("source: mock");
    expect(combined).toContain("REFERENCE/SANDBOX");
    expect(combined).toContain("LIVE UAT");
    expect(combined).toContain("UNAVAILABLE");
    expect(combined).toContain("BLOCKED/DEPENDENCY");
    expect(combined.toLowerCase()).toContain("business-owner");
    expect(combined.toLowerCase()).toContain("security");
  });

  test("UAT evidence forbids production claims and sensitive evidence leakage", () => {
    const plan = read("docs/uat/reference-uat-plan.md");
    const evidence = read("docs/uat/uat-evidence-template.md");
    const acceptance = read("docs/uat/production-uat-acceptance.md");
    const combined = [plan, evidence, acceptance].join("\n").toLowerCase();

    expect(combined).toContain("synthetic");
    expect(combined).toContain("production acceptance");
    expect(combined).toContain("claimant");
    expect(combined).toContain("secret");
    expect(combined).toContain("real funds");
  });
});
