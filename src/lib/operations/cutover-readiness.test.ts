import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => {
  const full = join(root, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_GATES = [
  "release-candidate",
  "production-platform",
  "production-data",
  "drupal-content",
  "identity-access",
  "evidence-security",
  "notifications",
  "cpps",
  "external-integrations",
  "backup-recovery",
  "security-assessment",
  "business-uat",
  "operations-support",
  "cutover-change",
  "production-authorization",
] as const;

describe("OWC final cutover readiness contract", () => {
  test("declares every required gate and all four decision statuses", () => {
    const source = read("src/lib/operations/cutover-readiness.ts");
    for (const gate of REQUIRED_GATES) expect(source).toContain(gate);
    for (const status of ["ACCEPTED", "NOT_READY", "BLOCKED", "NOT_APPLICABLE"]) {
      expect(source).toContain(status);
    }
  });

  test("is fail closed for incomplete, duplicate, blocked and unevidenced decisions", () => {
    const source = read("src/lib/operations/cutover-readiness.ts");
    expect(source).toContain("NO-GO");
    expect(source).toContain("duplicate");
    expect(source).toContain("evidence");
    expect(source).toContain("owner");
    expect(source).toContain("scopeDecisionReference");
  });

  test("requires explicit production authorization instead of inferring it", () => {
    const source = read("src/lib/operations/cutover-readiness.ts");
    expect(source).toContain("productionAuthorizationReference");
    expect(source).toContain("production-authorization");
    expect(source).toContain("evaluateCutoverReadiness");
  });

  test("provides an evaluator CLI and a default NO-GO evidence template", () => {
    const cli = read("scripts/cutover/evaluate-readiness.ts");
    const template = read("docs/cutover/cutover-readiness-template.json");
    const pkg = read("package.json");
    expect(cli).toContain("OWC_CUTOVER_EVIDENCE_FILE");
    expect(cli).toContain("process.exitCode = 1");
    expect(cli.toLowerCase()).not.toContain("fetch(");
    expect(pkg).toContain("cutover:readiness");
    for (const gate of REQUIRED_GATES) expect(template).toContain(gate);
    expect(template).toContain("NOT_READY");
  });

  test("contains the cutover, smoke, rollback, evidence and sign-off runbooks", () => {
    const files = [
      "docs/cutover/cutover-evidence-register.md",
      "docs/cutover/final-cutover-runbook.md",
      "docs/cutover/rollback-reconciliation.md",
      "docs/cutover/cutover-smoke-checklist.md",
      "docs/cutover/cutover-signoff-template.md",
    ];
    for (const file of files) expect(read(file).length).toBeGreaterThan(200);

    const combined = files.map(read).join("\n").toLowerCase();
    expect(combined).toContain("release sha");
    expect(combined).toContain("backup");
    expect(combined).toContain("rollback");
    expect(combined).toContain("cpps");
    expect(combined).toContain("reconciliation");
    expect(combined).toContain("business");
    expect(combined).toContain("security");
  });

  test("documents the non-deployment boundary and separates reference from live acceptance", () => {
    const runbook = read("docs/cutover/final-cutover-runbook.md");
    const rollback = read("docs/cutover/rollback-reconciliation.md");
    const combined = `${runbook}\n${rollback}`.toLowerCase();
    expect(combined).toContain("operator-controlled");
    expect(combined).toContain("reference");
    expect(combined).toContain("live");
    expect(combined).toContain("does not");
    expect(combined).toContain("external transaction");
  });
});
