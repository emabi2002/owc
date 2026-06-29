import { ShieldCheck, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-shell";
import { InviteStaffButton } from "@/components/admin/invite-staff-button";
import { getStaff, ROLE_PERMISSIONS } from "@/lib/data/cms";
import { requirePermission } from "@/lib/auth/session";

export default async function UsersPage() {
  await requirePermission("users.manage");
  const staff = await getStaff();

  return (
    <>
      <AdminPageHeader
        title="Users & roles"
        description="Manage staff accounts and role-based access control across the console."
      >
        <InviteStaffButton />
      </AdminPageHeader>

      {/* Staff table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="font-serif text-lg font-bold text-primary">Staff accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((u) => (
                <tr key={u.email} className="hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{u.email}</td>
                  <td className="px-5 py-3"><Badge variant="navy">{u.role}</Badge></td>
                  <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-based access control */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <h2 className="font-serif text-lg font-bold text-primary">
            Role-based access control
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ROLE_PERMISSIONS.map((r) => (
            <div key={r.role} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-primary">{r.role}</h3>
              <ul className="mt-3 space-y-2">
                {r.can.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
