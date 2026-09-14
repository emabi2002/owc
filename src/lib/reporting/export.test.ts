import { describe, expect, test } from "bun:test";
import { DEMONSTRATION_CLAIMS } from "@/lib/demonstration/data-pack";
import { buildManagementReport, normalizeDemonstrationReportingRows } from "./service";
import { serializeReportCsv, serializeReportSpreadsheet } from "./export";

const report = buildManagementReport(
  normalizeDemonstrationReportingRows(DEMONSTRATION_CLAIMS),
  { report: "province" },
);

describe("OWC management report exports", () => {
  test("CSV carries report metadata, authoritative row count and source rows", () => {
    const csv = serializeReportCsv(report, {
      reportId: "OWC-RPT-TEST-001",
      generatedAt: "2026-09-14T08:00:00.000Z",
      generatedBy: "manager.demo@owc.gov.pg",
    });

    expect(csv).toContain("OWC-RPT-TEST-001");
    expect(csv).toContain(`Record count,${report.recordCount}`);
    expect(csv).toContain("Reference,Worker,Employer,Province,Status,Received");
    expect(csv.split("\n").filter((line) => line.startsWith("OWC-DEMO-")).length).toBe(report.recordCount);
  });

  test("spreadsheet export is Excel-compatible tabular text with matching totals", () => {
    const text = serializeReportSpreadsheet(report, {
      reportId: "OWC-RPT-TEST-002",
      generatedAt: "2026-09-14T08:00:00.000Z",
      generatedBy: "manager.demo@owc.gov.pg",
    });

    expect(text).toContain("OWC-RPT-TEST-002");
    expect(text).toContain(`Record count\t${report.recordCount}`);
    expect(text).toContain(`Total claims\t${report.totals.totalClaims}`);
    expect(text.split("\n").filter((line) => line.startsWith("OWC-DEMO-")).length).toBe(report.recordCount);
  });
});
