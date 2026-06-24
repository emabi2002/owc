"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Globe,
  LogIn,
  CheckCircle2,
  Download,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AUDIT_LOG, type AuditEntry } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  AuditEntry["type"],
  { icon: React.ElementType; cls: string; label: string }
> = {
  create: { icon: Plus, cls: "bg-success/10 text-success", label: "Create" },
  update: { icon: Pencil, cls: "bg-primary/10 text-primary", label: "Update" },
  delete: { icon: Trash2, cls: "bg-destructive/10 text-destructive", label: "Delete" },
  publish: { icon: Globe, cls: "bg-gold/15 text-gold-foreground", label: "Publish" },
  login: { icon: LogIn, cls: "bg-secondary text-muted-foreground", label: "Login" },
  approve: { icon: CheckCircle2, cls: "bg-success/10 text-success", label: "Approve" },
};

// extend the demo log a little
const FULL_LOG: AuditEntry[] = [
  ...AUDIT_LOG,
  { time: "2026-06-16 09:30", user: "Admin", action: "Updated", target: "System settings: backup schedule", type: "update" },
  { time: "2026-06-15 17:12", user: "P. Namaliu", action: "Updated", target: "Claim OWC-2026-004815 → Approved", type: "approve" },
  { time: "2026-06-15 08:45", user: "G. Sori", action: "Signed in", target: "Admin console", type: "login" },
];

export default function AuditPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      FULL_LOG.filter(
        (a) =>
          q.trim() === "" ||
          a.user.toLowerCase().includes(q.toLowerCase()) ||
          a.target.toLowerCase().includes(q.toLowerCase()) ||
          a.action.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

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

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-serif text-lg font-bold text-primary">Activity history</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search logs…" className="h-9 pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Details</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">User</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a, i) => {
                const meta = TYPE_META[a.type];
                return (
                  <tr key={i} className="hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold", meta.cls)}>
                        <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-foreground">{a.target}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{a.user}</td>
                    <td className="hidden whitespace-nowrap px-5 py-3 font-mono text-xs text-muted-foreground md:table-cell">{a.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
