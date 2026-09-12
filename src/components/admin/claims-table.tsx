"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Eye, FileText, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/admin-shell";
import type { AdminClaim } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const STATUSES = [
  "All",
  "New",
  "Under Assessment",
  "Awaiting Documents",
  "Approved",
  "Paid",
  "Declined",
];

export function ClaimsTable({ claims }: { claims: AdminClaim[] }) {
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      claims.filter(
        (c) =>
          (status === "All" || c.status === status) &&
          (q.trim() === "" ||
            c.ref.toLowerCase().includes(q.toLowerCase()) ||
            c.worker.toLowerCase().includes(q.toLowerCase()) ||
            c.employer.toLowerCase().includes(q.toLowerCase())),
      ),
    [status, q, claims],
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                status === s
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search claims…"
            className="h-9 pl-9"
            aria-label="Search claims"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Reference</th>
              <th className="px-5 py-3 font-semibold">Worker</th>
              <th className="hidden px-5 py-3 font-semibold md:table-cell">Employer</th>
              <th className="hidden px-5 py-3 font-semibold sm:table-cell">Type</th>
              <th className="hidden px-5 py-3 font-semibold lg:table-cell">Lodged</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => {
              const href = `/admin/claims/${encodeURIComponent(c.ref)}`;
              return (
                <tr key={c.ref} className="hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-semibold text-primary">
                    <Link href={href} className="hover:underline">{c.ref}</Link>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{c.worker}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{c.employer}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{c.type}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{c.lodged}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={href} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary" aria-label={`View claim ${c.ref}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`${href}#evidence`} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary" aria-label={`View evidence for ${c.ref}`}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {claims.length} claims
      </div>
    </div>
  );
}
