import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import { buildManagementReport } from "@/lib/reporting/service";
import { loadManagementReportingSource } from "@/lib/reporting/source";
import { serializeReportCsv, serializeReportSpreadsheet } from "@/lib/reporting/export";
import { recordReportingAudit } from "@/lib/reporting/audit";
import type { ManagementReportKind, ManagementReportRequest } from "@/lib/reporting/types";

const REPORT_KINDS = new Set<ManagementReportKind>([
  "executive",
  "province",
  "employer",
  "aging",
  "category",
  "turnaround",
  "payments",
]);

function reportKind(value: string | null): ManagementReportKind {
  return value && REPORT_KINDS.has(value as ManagementReportKind)
    ? (value as ManagementReportKind)
    : "executive";
}

function optional(search: URLSearchParams, key: string): string | undefined {
  const value = search.get(key)?.trim();
  return value || undefined;
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!hasPermission(user.role, "reports.export")) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const search = request.nextUrl.searchParams;
  const format = search.get("format");
  if (format !== "csv" && format !== "excel") {
    return NextResponse.json({ error: "Unsupported export format" }, { status: 400 });
  }

  const reportRequest: ManagementReportRequest = {
    report: reportKind(search.get("report")),
    from: optional(search, "from"),
    to: optional(search, "to"),
    province: optional(search, "province"),
    employer: optional(search, "employer"),
    status: optional(search, "status"),
  };

  const source = await loadManagementReportingSource({
    mode: isDemonstrationIdentityMode() ? "demonstration" : "live",
    liveReader: null,
  });
  if (!source.available) {
    return NextResponse.json(
      { error: source.reason ?? "Management reporting source unavailable" },
      { status: 503 },
    );
  }

  const report = buildManagementReport(source.rows, reportRequest);
  const generatedAt = new Date().toISOString();
  const reportId = `OWC-RPT-${Date.now()}`;
  const metadata = { reportId, generatedAt, generatedBy: user.email };
  const isCsv = format === "csv";
  const body = isCsv
    ? serializeReportCsv(report, metadata)
    : serializeReportSpreadsheet(report, metadata);

  await recordReportingAudit({
    event: "export",
    actor: { id: user.id, email: user.email },
    reportId,
    request: reportRequest,
    recordCount: report.recordCount,
    exportFormat: isCsv ? "csv" : "excel",
  });

  const extension = isCsv ? "csv" : "xls";
  const contentType = isCsv
    ? "text/csv; charset=utf-8"
    : "application/vnd.ms-excel; charset=utf-8";

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${reportRequest.report}-${reportId}.${extension}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
