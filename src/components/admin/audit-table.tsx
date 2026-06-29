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
  Send,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AuditEntry } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  AuditEntry["type"],
  { icon: React.ElementType; cls: string; label: string }
> = {
  create: { icon: Plus, cls: "bg-success/10 text-success", label: "Create" },
  update: { icon: Pencil, cls: "bg-primary/10 text-primary", label: "Update" },
  delete: { icon: Trash2, cls: "bg-destructive/10 text-destructive", label: "Delete" },
  publish: { icon: Globe, cls: "bg-gold/15 text-gold-foreground", label: "Publish" },
  submit: { icon: Send, cls: "bg-warning/15 text-warning", label: "Submit" },
  approve: { icon: CheckCircle2, cls: "bg-success/10 text-success", label: "Approve" },
  login: { icon: LogIn, cls: "bg-secondary text-muted-foreground", label: "Login" },
  failed_login: { icon: ShieldAlert, cls: "bg-destructive/10 text-destructive", label: "Failed login" },
  role_change: { icon: UserCog, cls: "bg-primary/10 text-primary", label: "Role change" },
};

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      entries.filter(
        (a) =>
          q.trim() === "" ||
          a.user.toLowerCase().includes(q.toLowerCase()) ||
          a.target.toLowerCase().includes(q.toLowerCase()) ||
          a.action.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, entries],
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-serif text-lg font-bold text-primary">Activity history</h2>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search logs…"
            className="h-9 pl-9"
            aria-label="Search audit logs"
          />
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
              const meta = TYPE_META[a.type] ?? TYPE_META.update;
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
  );
}
