import { Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AuditTable } from "@/components/admin/audit-table";
import { getAuditLog } from "@/lib/data/audit";
import { requirePermission } from "@/lib/auth/session";

export default async function AuditPage() {
  await requirePermission("audit.view");
  const entries = await getAuditLog(100);

  return (
    <>
      <AdminPageHeader
        title="Audit logs"
        description="A complete, tamper-evident record of every action taken in the console."
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export log
        </Button>
      </AdminPageHeader>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-foreground">
        <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
        Audit logging is <strong>enabled</strong>. Entries are retained for 7
        years and cannot be modified, in line with PNG Government ICT and
        cybersecurity requirements.
      </div>

      <AuditTable entries={entries} />
    </>
  );
}
