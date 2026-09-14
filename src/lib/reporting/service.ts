import type { DemonstrationClaim } from "@/lib/demonstration/data-pack";
import type {
  ManagementReportGroup,
  ManagementReportRequest,
  ManagementReportResult,
  ManagementReportingRow,
} from "./types";

const REPORT_TITLES: Record<ManagementReportRequest["report"], string> = {
  executive: "Executive Claims Summary",
  province: "Claims by Province",
  employer: "Claims by Employer",
  aging: "Claims Aging",
  category: "Claims by Injury Category",
  turnaround: "Processing Turnaround",
  payments: "Compensation and Payment Status",
};

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function paymentStatusForDemo(claim: DemonstrationClaim): string {
  if (claim.simulatedPaymentAmountPgk == null) return "NONE";
  if (claim.status === "SIMULATED_PAYMENT" || claim.status === "CLOSED") {
    return "SIMULATED_PAID";
  }
  return "SCHEDULED";
}

export function normalizeDemonstrationReportingRows(
  claims: readonly DemonstrationClaim[],
): ManagementReportingRow[] {
  return claims.map((claim) => ({
    reference: claim.reference,
    workerName: claim.workerName,
    employerName: claim.employerName,
    province: claim.province,
    district: null,
    industry: claim.industry,
    occupation: claim.occupation,
    injuryType: claim.injuryType,
    receivedAt: claim.receivedAt,
    status: claim.status,
    decision: claim.decision,
    compensationAmountPgk: claim.simulatedPaymentAmountPgk,
    turnaroundDays: claim.turnaroundDays,
    notificationStatus: claim.notificationStatus,
    paymentStatus: paymentStatusForDemo(claim),
    assignedOfficer: null,
    synthetic: true,
  }));
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function applyFilters(
  rows: readonly ManagementReportingRow[],
  request: ManagementReportRequest,
): ManagementReportingRow[] {
  return rows.filter((row) => {
    const received = dateOnly(row.receivedAt);
    if (request.from && received < request.from) return false;
    if (request.to && received > request.to) return false;
    if (
      request.province &&
      row.province.toLocaleLowerCase() !== request.province.toLocaleLowerCase()
    ) {
      return false;
    }
    if (
      request.employer &&
      row.employerName.toLocaleLowerCase() !== request.employer.toLocaleLowerCase()
    ) {
      return false;
    }
    if (
      request.status &&
      row.status.toLocaleLowerCase() !== request.status.toLocaleLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

function countByStatus(rows: readonly ManagementReportingRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

function groupBy(
  rows: readonly ManagementReportingRow[],
  keyOf: (row: ManagementReportingRow) => string,
): ManagementReportGroup[] {
  const groups = new Map<
    string,
    { count: number; amountPgk: number; turnaroundTotal: number; turnaroundCount: number }
  >();

  for (const row of rows) {
    const key = keyOf(row) || "Unspecified";
    const current = groups.get(key) ?? {
      count: 0,
      amountPgk: 0,
      turnaroundTotal: 0,
      turnaroundCount: 0,
    };
    current.count += 1;
    current.amountPgk += row.compensationAmountPgk ?? 0;
    if (typeof row.turnaroundDays === "number") {
      current.turnaroundTotal += row.turnaroundDays;
      current.turnaroundCount += 1;
    }
    groups.set(key, current);
  }

  return [...groups.entries()]
    .map(([key, value]) => ({
      key,
      label: key,
      count: value.count,
      amountPgk: value.amountPgk,
      averageTurnaroundDays:
        value.turnaroundCount > 0
          ? round(value.turnaroundTotal / value.turnaroundCount)
          : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function buildAgingGroups(rows: readonly ManagementReportingRow[]): ManagementReportGroup[] {
  const bands = [
    { key: "0-30", min: 0, max: 30 },
    { key: "31-60", min: 31, max: 60 },
    { key: "61-90", min: 61, max: 90 },
    { key: "90+", min: 91, max: Number.POSITIVE_INFINITY },
  ];

  return bands.map((band) => ({
    key: band.key,
    label: band.key,
    count: rows.filter((row) => {
      const age = row.turnaroundDays ?? 0;
      return age >= band.min && age <= band.max;
    }).length,
  }));
}

function groupsFor(
  rows: readonly ManagementReportingRow[],
  report: ManagementReportRequest["report"],
): ManagementReportGroup[] {
  switch (report) {
    case "province":
      return groupBy(rows, (row) => row.province);
    case "employer":
      return groupBy(rows, (row) => row.employerName);
    case "category":
      return groupBy(rows, (row) => row.injuryType ?? "Unspecified");
    case "aging":
      return buildAgingGroups(rows);
    case "turnaround":
      return groupBy(rows, (row) => row.status);
    case "payments":
      return groupBy(rows, (row) => row.paymentStatus ?? "UNSPECIFIED");
    case "executive":
    default:
      return groupBy(rows, (row) => row.status);
  }
}

export function buildManagementReport(
  sourceRows: readonly ManagementReportingRow[],
  request: ManagementReportRequest,
): ManagementReportResult {
  const rows = applyFilters(sourceRows, request);
  const turnaround = rows
    .map((row) => row.turnaroundDays)
    .filter((value): value is number => typeof value === "number");
  const paymentTotal = rows.reduce(
    (sum, row) => sum + (row.compensationAmountPgk ?? 0),
    0,
  );
  const statusCounts = countByStatus(rows);
  const approvedClaims = rows.filter((row) => row.decision === "APPROVED").length;
  const declinedClaims = rows.filter((row) => row.decision === "DECLINED").length;
  const pendingClaims = rows.filter((row) => row.decision === "PENDING").length;
  const syntheticData = rows.length > 0 && rows.every((row) => row.synthetic === true);

  return {
    report: request.report,
    title: REPORT_TITLES[request.report],
    request: { ...request },
    recordCount: rows.length,
    totals: {
      totalClaims: rows.length,
      approvedClaims,
      declinedClaims,
      pendingClaims,
      closedClaims: rows.filter((row) => row.status === "CLOSED").length,
      averageTurnaroundDays:
        turnaround.length > 0
          ? round(turnaround.reduce((sum, value) => sum + value, 0) / turnaround.length)
          : 0,
      maximumTurnaroundDays: turnaround.length > 0 ? Math.max(...turnaround) : 0,
      illustrativePaymentAmountPgk: paymentTotal,
    },
    statusCounts,
    groups: groupsFor(rows, request.report),
    rows: rows.map((row) => ({ ...row })),
    syntheticData,
    disclosure: syntheticData
      ? "Demonstration reporting uses synthetic records and illustrative payment values only; no real money moves."
      : "Reporting is read-only. Payment values shown here do not initiate or approve financial transactions.",
  };
}
