import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { DemoRunner } from "@/components/integrations/demo-runner";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";

export default async function IntegrationDemoPage() {
  await requirePermission("audit.view");

  return (
    <>
      <AdminPageHeader
        title="OWC Live Integration Demonstration"
        description="End-to-end RFQ demonstration of the OWC claims ecosystem using controlled synthetic agency services."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/integrations">
            <ArrowLeft className="h-4 w-4" /> Integration monitor
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <strong>Demonstration environment.</strong> This scenario uses synthetic people,
          employers, medical records, insurance policies and banking transactions.
          It demonstrates production-ready API patterns without claiming access to live agency systems.
        </div>
      </div>

      <DemoRunner />
    </>
  );
}
