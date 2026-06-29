import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <>
      <AdminShell
        user={{
          name: user.fullName,
          email: user.email,
          role: ROLE_LABELS[user.role],
          demo: user.demo,
        }}
      >
        {children}
      </AdminShell>
      <Toaster position="top-center" richColors />
    </>
  );
}
