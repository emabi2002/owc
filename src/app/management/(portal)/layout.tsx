import { Toaster } from "@/components/ui/sonner";
import { ManagementShell } from "@/components/management/management-shell";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePermission("reports.view");

  return (
    <>
      <ManagementShell
        user={{ name: user.fullName, email: user.email, demo: user.demo }}
      >
        {children}
      </ManagementShell>
      <Toaster position="top-center" richColors />
    </>
  );
}
