import { describe, expect, test } from "bun:test";
import { buildReportingAuditInput } from "./audit";

const actor = {
  id: "manager-001",
  email: "manager.demo@owc.gov.pg",
};

const filters = {
  report: "province" as const,
  from: "2026-01-01",
  to: "2026-06-30",
  province: "Morobe",
};

describe("OWC management reporting audit boundary", () => {
  test("records report access using metadata rather than claimant-sensitive values", () => {
    const entry = buildReportingAuditInput({
      event: "access",
      actor,
      reportId: "report-001",
      request: filters,
      recordCount: 12,
    });

    expect(entry.entity).toBe("management_report");
    expect(entry.entityId).toBe("report-001");
    expect(entry.actorEmail).toBe(actor.email);
    expect(entry.metadata).toEqual({
      event: "access",
      report: "province",
      from: "2026-01-01",
      to: "2026-06-30",
      province: "Morobe",
      employer: null,
      status: null,
      recordCount: 12,
      exportFormat: null,
    });
    expect(JSON.stringify(entry)).not.toContain("workerName");
    expect(JSON.stringify(entry)).not.toContain("medical");
    expect(JSON.stringify(entry)).not.toContain("bank");
  });

  test("captures export format without adding operational write semantics", () => {
    const entry = buildReportingAuditInput({
      event: "export",
      actor,
      reportId: "report-002",
      request: { report: "executive" },
      recordCount: 20,
      exportFormat: "csv",
    });

    expect(entry.action).toBe("update");
    expect(entry.metadata?.exportFormat).toBe("csv");
    expect(entry.summary).toContain("export");
    expect(entry.summary).not.toContain("approved claim");
  });
});
