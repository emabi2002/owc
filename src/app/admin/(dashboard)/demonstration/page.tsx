import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, BriefcaseBusiness, WalletCards } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { DemonstrationServiceControls } from "@/components/admin/demonstration-service-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";
import { buildDemonstrationReport } from "@/lib/demonstration/reporting";

export default async function DemonstrationDashboardPage() {
  const user = await requirePermission("claims.view");
  const report = buildDemonstrationReport();

  return (
    <>
      <AdminPageHeader
        title="OWC Demonstration"
        description="Presentation cockpit for deterministic synthetic claims and simulated integration evidence."
      >
        <Button asChild size="sm">
          <Link href="/admin/demonstration/officer">
            Officer workbenches <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS</p>
            <p className="mt-1 text-sm">
              This view is presentation evidence only. productionAcceptance=false; simulated payment records use
              simulation=true and moneyMovement=false.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={BriefcaseBusiness} label="Synthetic claims" value={String(report.totalClaims)} />
        <Metric icon={BarChart3} label="Average turnaround" value={`${report.averageTurnaroundDays} days`} />
        <Metric icon={WalletCards} label="Completed simulated payments" value={String(report.completedSimulatedPayments)} />
        <Metric icon={AlertTriangle} label="Notification failures" value={String(report.notificationFailures)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-bold text-primary">Lifecycle distribution</h2>
            <Badge variant="navy">20-record deterministic pack</Badge>
          </div>
          <div className="space-y-2">
            {Object.entries(report.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm font-medium">{status.replaceAll("_", " ")}</span>
                <span className="font-mono text-sm font-bold text-primary">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-primary">Presentation payment evidence</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Amounts are illustrative values attached to synthetic claims; they are not settlement instructions,
            banking confirmations or proof of financial movement.
          </p>
          <div className="mt-5 rounded-lg bg-secondary p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Illustrative total</p>
            <p className="mt-1 font-serif text-3xl font-bold text-primary">
              K{report.illustrativePaymentAmountPgk.toLocaleString("en-US")}
            </p>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Boundary label="simulation" value="true" />
            <Boundary label="moneyMovement" value="false" />
            <Boundary label="syntheticData" value="true" />
            <Boundary label="productionAcceptance" value="false" />
          </dl>
        </section>
      </div>

      {user.role === "administrator" && user.demo && (
        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="font-serif text-lg font-bold text-primary">Failure and recovery rehearsal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Administrator-only controls change process-local sandbox state for presentation purposes. They cannot contact production services.
            </p>
          </div>
          <DemonstrationServiceControls />
        </section>
      )}
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-4 font-serif text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Boundary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono font-semibold text-foreground">{value}</dd>
    </div>
  );
}
