import Link from "next/link";
import { AlertTriangle, FileSpreadsheet, Filter } from "lucide-react";
import { ReportExportActions } from "@/components/management/report-export-actions";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import { requirePermission } from "@/lib/auth/session";
import { buildManagementReport } from "@/lib/reporting/service";
import { loadManagementReportingSource } from "@/lib/reporting/source";
import { recordReportingAudit } from "@/lib/reporting/audit";
import type { ManagementReportKind, ManagementReportRequest } from "@/lib/reporting/types";

const REPORTS: { value: ManagementReportKind; label: string }[] = [
  { value: "executive", label: "Executive Claims Summary" },
  { value: "province", label: "Claims by Province" },
  { value: "employer", label: "Claims by Employer" },
  { value: "aging", label: "Claims Aging" },
  { value: "category", label: "Claims by Injury Category" },
  { value: "turnaround", label: "Processing Turnaround" },
  { value: "payments", label: "Compensation and Payment Status" },
];

function asReport(value: string | undefined): ManagementReportKind {
  return REPORTS.some((report) => report.value === value)
    ? (value as ManagementReportKind)
    : "executive";
}

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

export default async function ManagementReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission("reports.view", {
    redirectTo: "/management/reports",
    loginPath: "/management/login",
    deniedPath: "/management/login",
  });
  const params = await searchParams;
  const request: ManagementReportRequest = {
    report: asReport(param(params.report)),
    from: param(params.from),
    to: param(params.to),
    province: param(params.province),
    employer: param(params.employer),
    status: param(params.status),
  };

  const source = await loadManagementReportingSource({
    mode: isDemonstrationIdentityMode() ? "demonstration" : "live",
    liveReader: null,
  });

  if (!source.available) {
    return (
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3 text-primary">
          <AlertTriangle className="h-6 w-6 text-gold" />
          <h1 className="font-serif text-2xl font-bold">Management reporting unavailable</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{source.reason}</p>
        <p className="mt-2 text-xs text-muted-foreground">No demonstration records are substituted into a live reporting session.</p>
      </section>
    );
  }

  const report = buildManagementReport(source.rows, request);
  const reportId = `OWC-RPT-${Date.now()}`;
  await recordReportingAudit({
    event: "generate",
    actor: { id: user.id, email: user.email },
    reportId,
    request,
    recordCount: report.recordCount,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gold">Authorised management reporting</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-primary">{report.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Report ID: {reportId} · {source.environment} · {report.recordCount} records</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap justify-end gap-3 text-sm font-semibold">
              <Link href="/management" className="text-primary hover:underline">Executive workspace</Link>
              <Link href="/management/analyst" className="text-primary hover:underline">Ask AI Analyst</Link>
            </div>
            <ReportExportActions request={request} />
          </div>
        </div>
        {report.syntheticData && (
          <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-muted-foreground">{report.disclosure}</div>
        )}
      </section>

      <form className="grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-3 lg:grid-cols-6 print:hidden">
        <label className="text-xs font-semibold text-muted-foreground lg:col-span-2">
          Report
          <select name="report" defaultValue={request.report} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground">
            {REPORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">From<InputField name="from" type="date" value={request.from} /></label>
        <label className="text-xs font-semibold text-muted-foreground">To<InputField name="to" type="date" value={request.to} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Province<InputField name="province" value={request.province} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Status<InputField name="status" value={request.status} /></label>
        <div className="flex items-end lg:col-span-6">
          <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"><Filter className="h-4 w-4" /> Apply filters</button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total claims" value={report.totals.totalClaims.toLocaleString()} />
        <Kpi label="Approved" value={report.totals.approvedClaims.toLocaleString()} />
        <Kpi label="Pending" value={report.totals.pendingClaims.toLocaleString()} />
        <Kpi label="Average turnaround" value={`${report.totals.averageTurnaroundDays} days`} />
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-primary">Report breakdown</h2>
            <p className="text-xs text-muted-foreground">Aggregated from the protected read-only reporting source.</p>
          </div>
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-5 py-3">Group</th><th className="px-5 py-3 text-right">Claims</th><th className="px-5 py-3 text-right">Amount PGK</th><th className="px-5 py-3 text-right">Avg turnaround</th></tr>
            </thead>
            <tbody>
              {report.groups.map((group) => (
                <tr key={group.key} className="border-t">
                  <td className="px-5 py-3 font-medium">{group.label}</td>
                  <td className="px-5 py-3 text-right">{group.count}</td>
                  <td className="px-5 py-3 text-right">{typeof group.amountPgk === "number" ? group.amountPgk.toLocaleString("en-PG", { maximumFractionDigits: 2 }) : "—"}</td>
                  <td className="px-5 py-3 text-right">{typeof group.averageTurnaroundDays === "number" ? `${group.averageTurnaroundDays} days` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="rounded-2xl border bg-card p-5 print:hidden">
        <summary className="cursor-pointer font-semibold text-primary">Show source data ({report.rows.length} rows)</summary>
        <p className="mt-2 text-xs text-muted-foreground">Source rows are shown only inside the protected management workspace. Sensitive fields not required for this report are not included.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-4">Reference</th><th className="py-2 pr-4">Province</th><th className="py-2 pr-4">Employer</th><th className="py-2 pr-4">Status</th><th className="py-2">Received</th></tr></thead>
            <tbody>{report.rows.map((row) => <tr key={row.reference} className="border-b"><td className="py-2 pr-4 font-mono">{row.reference}</td><td className="py-2 pr-4">{row.province}</td><td className="py-2 pr-4">{row.employerName}</td><td className="py-2 pr-4">{row.status}</td><td className="py-2">{row.receivedAt.slice(0, 10)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function InputField({ name, value, type = "text" }: { name: string; value?: string; type?: string }) {
  return <input name={name} type={type} defaultValue={value ?? ""} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm font-normal text-foreground" />;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-card p-5"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-bold text-primary">{value}</div></div>;
}
