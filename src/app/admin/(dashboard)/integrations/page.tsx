import Link from "next/link";
import { PlayCircle } from "lucide-react";
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
        description="Real-time health, transaction telemetry and service orchestration across the OWC claims ecosystem."
      >
        <Button asChild size="sm">
          <Link href="/admin/integrations/process">
            <PlayCircle className="h-4 w-4" /> Process claim workflow
          </Link>
        </Button>
      </AdminPageHeader>

      <IntegrationMonitor />
    </>
  );
}
