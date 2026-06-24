"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileEdit,
  Eye,
  Check,
  X,
  PenLine,
  Send,
  CheckCircle2,
  Globe,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-shell";
import { CONTENT_ITEMS, type ContentItem } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const TYPES = ["All", "News", "Notice", "Page", "Report", "Form"] as const;

const WORKFLOW = [
  { icon: PenLine, t: "Draft", d: "Author creates and edits content." },
  { icon: Send, t: "Submitted", d: "Sent to a reviewer for checking." },
  { icon: CheckCircle2, t: "Approved", d: "Reviewer approves the content." },
  { icon: Globe, t: "Published", d: "Content goes live on the website." },
];

export default function ContentPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      CONTENT_ITEMS.filter(
        (c) =>
          (type === "All" || c.type === type) &&
          (q.trim() === "" || c.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [type, q]
  );

  const pending = CONTENT_ITEMS.filter((c) => c.status === "Pending Review");

  return (
    <>
      <AdminPageHeader
        title="Content management"
        description="Create, edit and publish news, pages, reports, forms and public notices."
      >
        <Button size="sm" onClick={() => toast.success("New content editor opened")}>
          <Plus className="h-4 w-4" /> New content
        </Button>
      </AdminPageHeader>

      {/* Workflow */}
      <div id="approvals" className="mb-6 scroll-mt-20 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-primary">
          Content approval workflow
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All content moves through a structured review process before it is
          published to the public website.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW.map((w, i) => (
            <div key={w.t} className="relative rounded-lg border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
                  <w.icon className="h-4 w-4" />
                </span>
                <span className="font-semibold text-foreground">{i + 1}. {w.t}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{w.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="mb-6 rounded-xl border border-warning/40 bg-warning/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
              Awaiting your review
              <span className="rounded-full bg-warning px-2 text-xs font-bold text-warning-foreground">
                {pending.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-foreground">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.type} · submitted by {c.author} · {c.updated}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info("Opening preview…")}>
                  <Eye className="h-4 w-4" /> Preview
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => toast.error("Returned for changes")}>
                  <X className="h-4 w-4" /> Return
                </Button>
                <Button size="sm" onClick={() => toast.success(`Approved & published: ${c.title}`)}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  type === t
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content…" className="h-9 pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Type</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Author</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Updated</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c: ContentItem) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                        <FileEdit className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-foreground">{c.title}</span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{c.type}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{c.author}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{c.updated}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary" aria-label="Edit" onClick={() => toast.info(`Editing: ${c.title}`)}>
                        <PenLine className="h-4 w-4" />
                      </button>
                      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary" aria-label="More">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {CONTENT_ITEMS.length} items</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </>
  );
}
