import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ClaimsTable } from "@/components/admin/claims-table";
import { getAdminClaims } from "@/lib/data/cms";
import { requirePermission } from "@/lib/auth/session";

export default async function AdminClaimsPage() {
  await requirePermission("claims.view");
  const claims = await getAdminClaims();

  return (
    <>
      <AdminPageHeader
        title="Claims management"
        description="View, assess and update workers compensation claims."
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </AdminPageHeader>

      <ClaimsTable claims={claims} />
    </>
  );
}
