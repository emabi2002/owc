import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("OWC security assessment readiness contract", () => {
  test("database authorization requires active profiles and protects privileged self-update fields", () => {
    const schema = read("src/lib/db/schema.sql");

    expect(schema).toContain("create or replace function public.current_app_role()");
    expect(schema).toContain("create or replace function public.is_staff()");
    expect(schema).toMatch(/from public\.profiles[\s\S]{0,220}status = 'active'/i);
    expect(schema).toContain("protect_profile_privileged_fields");
    expect(schema).toContain("new.email is distinct from old.email");
    expect(schema).toContain("new.role is distinct from old.role");
    expect(schema).toContain("new.status is distinct from old.status");
    expect(schema).toContain("new.mfa_enabled is distinct from old.mfa_enabled");
    expect(schema).toContain("before update on public.profiles");
  });

  test("already-provisioned environments have an idempotent security hardening SQL", () => {
    const migration = read("src/lib/db/security-hardening-2026-09-14.sql");

    expect(migration).toContain("current_app_role");
    expect(migration).toContain("is_staff");
    expect(migration).toContain("protect_profile_privileged_fields");
    expect(migration).toContain("drop trigger if exists protect_profile_privileged_fields");
  });

  test("production CSP excludes unsafe-eval", () => {
    const nginx = read("deploy/nginx.conf");

    expect(nginx).toContain("Content-Security-Policy");
    expect(nginx).not.toContain("unsafe-eval");
  });

  test("repository assurance is static and credential-safe", () => {
    const script = read("scripts/security/repository-assurance.sh");

    expect(script).toContain("set -euo pipefail");
    expect(script).toContain("git ls-files");
    expect(script).toContain(".env.local");
    expect(script).toContain("PRIVATE KEY");
    expect(script).toContain("unsafe-eval");
    expect(script).not.toMatch(/\b(printenv|env\s*$|set\s*$)\b/m);
  });

  test("security checklist uses current OWASP baseline without unsupported retention claims", () => {
    const checklist = read("docs/SECURITY_CHECKLIST.md");

    expect(checklist).toContain("OWASP Top 10:2025");
    expect(checklist).toContain("ASVS 5.0.0");
    expect(checklist).not.toContain("target: 7 years");
    expect(checklist).toContain("retention policy");
  });

  test("external assessment package separates evidence, findings, retest and acceptance", () => {
    const scope = read("docs/security/security-assessment-scope.md");
    const evidence = read("docs/security/security-assessment-evidence-template.md");
    const findings = read("docs/security/security-finding-register.md");
    const gates = read("docs/security/security-acceptance-gates.md");
    const combined = [scope, evidence, findings, gates].join("\n");

    expect(combined).toContain("OWASP Top 10:2025");
    expect(combined).toContain("ASVS 5.0.0");
    expect(combined.toLowerCase()).toContain("independent");
    expect(combined.toLowerCase()).toContain("retest");
    expect(combined.toLowerCase()).toContain("risk acceptance");
    expect(combined.toLowerCase()).toContain("claimant");
    expect(combined.toLowerCase()).toContain("secret");
    expect(combined).not.toMatch(/certified compliant|fully ASVS compliant/i);
  });
});
