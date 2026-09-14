import { describe, expect, test } from "bun:test";
import { DEMONSTRATION_CLAIMS } from "@/lib/demonstration/data-pack";
import {
  buildManagementReport,
  normalizeDemonstrationReportingRows,
} from "./service";

const rows = normalizeDemonstrationReportingRows(DEMONSTRATION_CLAIMS);

function groupCount(
  groups: readonly { key: string; count: number }[],
  key: string,
): number | undefined {
  return groups.find((group) => group.key === key)?.count;
}

describe("OWC management reporting service", () => {
  test("reconciles the executive summary with the 20-record demonstration pack", () => {
    const report = buildManagementReport(rows, { report: "executive" });

    expect(report.recordCount).toBe(20);
    expect(report.totals.totalClaims).toBe(20);
    expect(report.totals.approvedClaims).toBe(10);
    expect(report.totals.declinedClaims).toBe(2);
    expect(report.totals.pendingClaims).toBe(8);
    expect(report.totals.closedClaims).toBe(3);
    expect(report.totals.averageTurnaroundDays).toBe(6.55);
    expect(report.totals.illustrativePaymentAmountPgk).toBe(80550);
  });

  test("groups claims deterministically by province and employer", () => {
    const province = buildManagementReport(rows, { report: "province" });
    const employer = buildManagementReport(rows, { report: "employer" });

    expect(groupCount(province.groups, "National Capital District")).toBe(3);
    expect(groupCount(province.groups, "Morobe")).toBe(1);
    expect(groupCount(employer.groups, "Pacific Engineering Ltd")).toBe(2);
  });

  test("produces aging bands and turnaround statistics", () => {
    const aging = buildManagementReport(rows, { report: "aging" });
    const turnaround = buildManagementReport(rows, { report: "turnaround" });

    expect(groupCount(aging.groups, "0-30")).toBe(20);
    expect(groupCount(aging.groups, "31-60")).toBe(0);
    expect(turnaround.totals.averageTurnaroundDays).toBe(6.55);
    expect(turnaround.totals.maximumTurnaroundDays).toBe(14);
  });

  test("reports status counts and illustrative payment totals without implying real settlement", () => {
    const executive = buildManagementReport(rows, { report: "executive" });
    const payments = buildManagementReport(rows, { report: "payments" });

    expect(executive.statusCounts.ASSESSMENT).toBe(3);
    expect(executive.statusCounts.DOCUMENTS_REQUIRED).toBe(3);
    expect(executive.statusCounts.SIMULATED_PAYMENT).toBe(2);
    expect(payments.totals.illustrativePaymentAmountPgk).toBe(80550);
    expect(payments.disclosure).toContain("illustrative");
    expect(payments.disclosure).toContain("no real money");
  });

  test("applies inclusive date and status filters before aggregation", () => {
    const dateFiltered = buildManagementReport(rows, {
      report: "executive",
      from: "2026-09-10",
      to: "2026-09-14",
    });
    const statusFiltered = buildManagementReport(rows, {
      report: "executive",
      status: "ASSESSMENT",
    });

    expect(dateFiltered.recordCount).toBe(8);
    expect(dateFiltered.rows.some((row) => row.reference === "OWC-2026-005112")).toBe(
      true,
    );
    expect(dateFiltered.rows.some((row) => row.reference === "OWC-2026-005119")).toBe(
      true,
    );
    expect(statusFiltered.recordCount).toBe(3);
    expect(statusFiltered.rows.every((row) => row.status === "ASSESSMENT")).toBe(true);
  });
});
