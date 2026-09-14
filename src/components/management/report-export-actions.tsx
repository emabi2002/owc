"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import type { ManagementReportRequest } from "@/lib/reporting/types";

function exportUrl(format: "csv" | "excel", request: ManagementReportRequest): string {
  const params = new URLSearchParams({ format, report: request.report });
  if (request.from) params.set("from", request.from);
  if (request.to) params.set("to", request.to);
  if (request.province) params.set("province", request.province);
  if (request.employer) params.set("employer", request.employer);
  if (request.status) params.set("status", request.status);
  return `/api/management/reports/export?${params.toString()}`;
}

export function ReportExportActions({ request }: { request: ManagementReportRequest }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold text-primary hover:bg-secondary"
      >
        <Printer className="h-4 w-4" /> Print / Save PDF
      </button>
      <a
        href={exportUrl("csv", request)}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold text-primary hover:bg-secondary"
      >
        <Download className="h-4 w-4" /> CSV
      </a>
      <a
        href={exportUrl("excel", request)}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold text-primary hover:bg-secondary"
      >
        <FileSpreadsheet className="h-4 w-4" /> Excel
      </a>
    </div>
  );
}
