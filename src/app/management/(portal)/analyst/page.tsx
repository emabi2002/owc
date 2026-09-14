import { ManagementAiPanel } from "@/components/management/management-ai-panel";
import { requirePermission } from "@/lib/auth/session";

export default async function ManagementAnalystPage() {
  await requirePermission("reports.ai.query", {
    redirectTo: "/management/analyst",
    loginPath: "/management/login",
    deniedPath: "/management/login",
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6">
        <p className="text-sm font-semibold text-gold">Protected management capability</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-primary">Read-only Management AI Analyst</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The analyst interprets management questions through approved reporting services only. It cannot alter claims, approve payments, change assignments, execute arbitrary SQL, or perform operational database writes.
        </p>
      </section>
      <ManagementAiPanel />
    </div>
  );
}
