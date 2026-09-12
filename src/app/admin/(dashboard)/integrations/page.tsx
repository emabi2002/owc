import Link from "next/link";
import { PlayCircle, ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { IntegrationMonitor } from "@/components/integrations/integration-monitor";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";

export default async function IntegrationsPage() {
  await requirePermission("audit.view");

  return (
    <>
      <AdminPageHeader
        title="Integration Control Centre"
        description="Live health and transaction telemetry for the controlled OWC RFQ integration sandbox."
      >
        <Button asChild size="sm">
          <Link href="/admin/integrations/demo">
            <PlayCircle className="h-4 w-4" /> Run live demo
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
        <div>
          <strong>Connection mode: SANDBOX.</strong> All agency, employer,
          medical, insurance and banking records on this screen are synthetic
          demonstration data. Production agency APIs require separate
          authorization and are not represented as connected here.
        </div>
      </div>

      <IntegrationMonitor />
    </>
  );
}
