import Link from "next/link";
import {
  FileText,
  ClipboardCheck,
  Mail,
  Building2,
  ArrowUpRight,
  TrendingUp,
  Eye,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-shell";
import { TrendChart } from "@/components/reports/charts";
import { getSessionUser } from "@/lib/auth/session";
import {
  getAdminClaims,
  getContentItems,
  getDashboardStats,
} from "@/lib/data/cms";
import { getAuditLog } from "@/lib/data/audit";

const ICONS: Record<string, React.ElementType> = {
  FileText,
  ClipboardCheck,
  Mail,
  Building2,
};

export default async function AdminDashboard() {
  const [user, stats, claims, content, audit] = await Promise.all([
    getSessionUser(),
    getDashboardStats(),
    getAdminClaims(),
    getContentItems(),
    getAuditLog(6),
  ]);

  const approvalQueue = content.filter((c) => c.status === "Submitted");
  const firstName = (user?.fullName ?? "there").split(" ")[0];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's what's happening across the Office today.`}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/audit">View audit log</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/admin/content">
            New content <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = ICONS[s.icon] ?? FileText;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/8 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {s.trend === "up" && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="mt-4 font-serif text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground/80">{s.delta}</div>
            </div>
          );
        })}
      </div>

      {/* Chart + approvals */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-primary">Claims overview</h2>
            <Badge variant="navy">2020–2025</Badge>
          </div>
          <TrendChart />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-primary">
              Approval queue
            </h2>
            <Badge variant="warning">{approvalQueue.length} pending</Badge>
          </div>
          <ul className="space-y-3">
            {approvalQueue.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Nothing awaiting review.
              </li>
            )}
            {approvalQueue.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <CircleDot className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.type} · {c.author}</div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/content#approvals">Review</Link>
                </Button>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-4 w-full text-primary">
            <Link href="/admin/content#approvals">Review all in CMS</Link>
          </Button>
        </div>
      </div>

      {/* Recent claims + activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-serif text-lg font-bold text-primary">Recent claims</h2>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/admin/claims">View all</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Worker</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Employer</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claims.map((c) => (
                  <tr key={c.ref} className="hover:bg-secondary/40">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-semibold text-primary">{c.ref}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{c.worker}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{c.employer}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link href="/admin/claims" className="text-muted-foreground hover:text-primary" aria-label="View claim">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-4">
          <h2 className="mb-4 font-serif text-lg font-bold text-primary">Recent activity</h2>
          <ol className="relative space-y-5 before:absolute before:left-[7px] before:top-1 before:h-[calc(100%-0.5rem)] before:w-px before:bg-border">
            {audit.slice(0, 6).map((a, i) => (
              <li key={i} className="relative flex gap-3 pl-6">
                <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-gold bg-card" />
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action.toLowerCase()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.target}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">{a.time}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild variant="ghost" size="sm" className="mt-4 w-full text-primary">
            <Link href="/admin/audit">
              View full audit log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
