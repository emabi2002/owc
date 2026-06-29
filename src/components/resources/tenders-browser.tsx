"use client";

import { useState } from "react";
import { Search, CalendarClock, Download, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TenderItem, TenderStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: ("All" | TenderStatus)[] = [
  "All",
  "open",
  "closing_soon",
  "closed",
  "awarded",
];

const STATUS_META: Record<
  TenderStatus,
  { label: string; variant: "success" | "warning" | "secondary" | "navy" }
> = {
  open: { label: "Open", variant: "success" },
  closing_soon: { label: "Closing soon", variant: "warning" },
  closed: { label: "Closed", variant: "secondary" },
  awarded: { label: "Awarded", variant: "navy" },
};

const fmt = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export function TendersBrowser({ items }: { items: TenderItem[] }) {
  const [status, setStatus] = useState<"All" | TenderStatus>("All");
  const [q, setQ] = useState("");

  const filtered = items.filter((t) => {
    const matchStatus = status === "All" || t.status === status;
    const matchQ =
      q.trim() === "" ||
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.reference.toLowerCase().includes(q.toLowerCase()) ||
      t.description.toLowerCase().includes(q.toLowerCase());
    return matchStatus && matchQ;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors",
                status === s
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:border-gold/50 hover:bg-secondary",
              )}
            >
              {s === "All" ? "All" : STATUS_META[s].label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tenders…"
            className="pl-9"
            aria-label="Search tenders"
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((t) => {
          const meta = STATUS_META[t.status];
          return (
            <div
              key={t.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-center"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                <Briefcase className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{t.reference}</span>
                </div>
                <h3 className="mt-1.5 font-serif text-lg font-bold text-primary">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Category: <strong className="text-foreground">{t.category}</strong></span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5 text-gold" /> Published {fmt(t.publishedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5 text-destructive" /> Closes {fmt(t.closingDate)}
                  </span>
                </div>
              </div>
              <Button
                variant={t.status === "open" || t.status === "closing_soon" ? "gold" : "outline"}
                size="sm"
                className="shrink-0"
                disabled={t.status === "closed" || t.status === "awarded"}
                onClick={() =>
                  t.fileUrl
                    ? window.open(t.fileUrl, "_blank", "noopener,noreferrer")
                    : toast.info(`Tender documents for ${t.reference} are available on request.`)
                }
              >
                <Download className="h-4 w-4" /> Documents
              </Button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
          No tenders match your search.
        </div>
      )}
    </div>
  );
}
