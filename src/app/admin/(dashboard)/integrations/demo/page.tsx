import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { DemoRunner } from "@/components/integrations/demo-runner";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";

export default async function IntegrationWorkflowPage() {
  await requirePermission("audit.view");

  return (
    <>
      <AdminPageHeader
        title="OWC Integrated Claim Processing"
        description="End-to-end orchestration of identity, employer, compliance, medical, insurance, banking and notification services."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/integrations">
            <ArrowLeft className="h-4 w-4" /> Integration control centre
          </Link>
        </Button>
      </AdminPageHeader>

      <DemoRunner />
    </>
  );
}
