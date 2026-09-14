import type { AuditInput } from "@/lib/data/audit";
import { recordAudit } from "@/lib/data/audit";
import type { ManagementReportRequest } from "./types";

export type ReportingAuditEvent = "access" | "generate" | "export" | "source_drilldown";
export type ReportingExportFormat = "csv" | "excel" | "pdf";

export type ReportingAuditActor = {
  id?: string;
  email?: string;
};

export type ReportingAuditInput = {
  event: ReportingAuditEvent;
  actor: ReportingAuditActor;
  reportId: string;
  request: ManagementReportRequest;
  recordCount: number;
  exportFormat?: ReportingExportFormat;
};

export function buildReportingAuditInput(input: ReportingAuditInput): AuditInput {
  return {
    action: "update",
    entity: "management_report",
    entityId: input.reportId,
    summary: `Management report ${input.event}: ${input.request.report}`,
    actorId: input.actor.id,
    actorEmail: input.actor.email,
    metadata: {
      event: input.event,
      report: input.request.report,
      from: input.request.from ?? null,
      to: input.request.to ?? null,
      province: input.request.province ?? null,
      employer: input.request.employer ?? null,
      status: input.request.status ?? null,
      recordCount: input.recordCount,
      exportFormat: input.exportFormat ?? null,
    },
  };
}

export async function recordReportingAudit(input: ReportingAuditInput): Promise<void> {
  await recordAudit(buildReportingAuditInput(input));
}
