"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Download, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-shell";
import { ADMIN_RECENT_CLAIMS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

// Build a larger demo set
const ALL_CLAIMS = [
  ...ADMIN_RECENT_CLAIMS,
  { ref: "OWC-2026-004805", worker: "B. Loko", employer: "Sepik Timber Co", type: "Eye injury", lodged: "13 Apr", status: "Under Assessment" as const },
  { ref: "OWC-2026-004801", worker: "N. Gima", employer: "Highlands Construction Ltd", type: "Sprain", lodged: "12 Apr", status: "Approved" as const },
  { ref: "OWC-2026-004798", worker: "C. Aro", employer: "Pacific Mining PNG", type: "Hearing loss", lodged: "11 Apr", status: "Paid" as const },
  { ref: "OWC-2026-004795", worker: "V. Dai", employer: "Coastal Logistics", type: "Fracture", lodged: "10 Apr", status: "New" as const },
];

const STATUSES = ["All", "New", "Under Assessment", "Awaiting Documents", "Approved", "Paid", "Declined"];

export default function AdminClaimsPage() {
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      ALL_CLAIMS.filter(
        (c) =>
          (status === "All" || c.status === status) &&
          (q.trim() === "" ||
            c.ref.toLowerCase().includes(q.toLowerCase()) ||
            c.worker.toLowerCase().includes(q.toLowerCase()) ||
            c.employer.toLowerCase().includes(q.toLowerCase()))
      ),
    [status, q]
  );

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
                    : "border-border bg-card text-foreground hover:bg-secondary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search claims…" className="h-9 pl-9" />
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
              {filtered.map((c) => (
                <tr key={c.ref} className="hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-semibold text-primary">{c.ref}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{c.worker}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{c.employer}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{c.type}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{c.lodged}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary" aria-label="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary" aria-label="Documents">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {ALL_CLAIMS.length} claims
        </div>
      </div>
    </>
  );
}
