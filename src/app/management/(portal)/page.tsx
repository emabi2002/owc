import Link from "next/link";
import { ArrowRight, BarChart3, Bot, ShieldCheck } from "lucide-react";

export default function ManagementDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gold">Management / Executive</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-primary">Executive information workspace</h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              Review authorised OWC management information through a read-only reporting boundary. Operational claim processing remains outside this workspace.
            </p>
          </div>
          <ShieldCheck className="hidden h-10 w-10 text-primary sm:block" />
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <Link href="/management/reports" className="group rounded-2xl border bg-card p-6 transition hover:border-gold">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-primary">Management reports</h2>
          <p className="mt-2 text-sm text-muted-foreground">Executive summary, province, employer, aging, turnaround and illustrative payment-status views.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open reports <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
        </Link>

        <div className="rounded-2xl border bg-card p-6">
          <Bot className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-primary">Management AI Analyst</h2>
          <p className="mt-2 text-sm text-muted-foreground">Read-only natural-language analysis will be added in the next implementation phase using the same protected reporting service.</p>
          <span className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">Next phase</span>
        </div>
      </div>
    </div>
  );
}
