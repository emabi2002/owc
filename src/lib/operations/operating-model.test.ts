import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("OWC operational administration and SLA contract", () => {
  test("operating model assigns the required functional ownership roles", () => {
    const content = read("docs/operations/operating-model.md");
    for (const role of [
      "OWC Service Owner",
      "OWC Operations Coordinator",
      "Tier-1/Tier-2 Support",
      "Application/Tier-3 Engineering",
      "Infrastructure/Platform Operations",
      "Database/Storage Operations",
      "CMS Administration",
      "Identity/Security",
      "CPPS / Integration Liaison",
    ]) {
      expect(content).toContain(role);
    }
    expect(content).toContain("named owner");
  });

  test("incident management defines severity, lifecycle and post-incident governance", () => {
    const content = read("docs/operations/incident-management.md");
    for (const severity of ["S1 Critical", "S2 High", "S3 Medium", "S4 Low"]) {
      expect(content).toContain(severity);
    }
    expect(content).toContain(
      "Detected → Logged → Triaged → Assigned → Investigating → Mitigated/Restored → Resolved → Validated → Closed",
    );
    expect(content).toContain("post-incident review");
    expect(content).toContain("correlation ID");
    expect(content).toContain("claimant");
  });

  test("support framework contains 12-month Tier-3 scope while leaving binding targets unapproved", () => {
    const content = read("docs/operations/support-sla.md");
    expect(content).toContain("12-month");
    expect(content).toContain("Tier-3");
    expect(content).toContain("Acknowledgement");
    expect(content).toContain("Technical response");
    expect(content).toContain("Restoration / workaround");
    expect(content).toContain("Resolution / action plan");
    expect((content.match(/UNAPPROVED/g) ?? []).length).toBeGreaterThanOrEqual(16);
    expect(content).toContain("service hours");
    expect(content).toContain("external dependency");
    expect(content).not.toMatch(/S[1-4][^\n]{0,120}\b\d+\s*(minutes?|hours?|days?)\b/i);
  });

  test("maintenance model covers controlled change, recovery, security and rollback", () => {
    const content = read("docs/operations/maintenance-and-patching.md");
    for (const term of [
      "routine change",
      "emergency change",
      "backup",
      "rollback",
      "Drupal",
      "TLS",
      "security",
      "maintenance calendar",
    ]) {
      expect(content.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  test("monthly service report captures operational evidence without inventing SLA attainment", () => {
    const content = read("docs/operations/service-report-template.md");
    for (const term of [
      "Availability",
      "Incidents",
      "SLA",
      "Releases",
      "Security",
      "Backup",
      "CPPS",
      "Integration",
      "Capacity",
      "Tier-3",
      "Risks",
      "Next period",
    ]) {
      expect(content).toContain(term);
    }
    expect(content).toContain("Not measured / target unapproved");
  });

  test("runbook index connects monitoring, recovery, incident, support and cutover governance", () => {
    const content = read("docs/operations/runbook-index.md");
    for (const path of [
      "production-monitoring.md",
      "backup-disaster-recovery.md",
      "incident-management.md",
      "support-sla.md",
      "maintenance-and-patching.md",
      "service-report-template.md",
    ]) {
      expect(content).toContain(path);
    }
    expect(content).toContain("production cutover");
    expect(content).toContain("external acceptance");
  });
});
