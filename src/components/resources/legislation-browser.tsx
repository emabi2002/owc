"use client";

import { useMemo, useState } from "react";
import { Search, Scale, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LegislationItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function LegislationBrowser({ items }: { items: LegislationItem[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const filtered = items.filter((i) => {
    const matchCat = cat === "All" || i.category === cat;
    const matchQ =
      q.trim() === "" ||
      i.title.toLowerCase().includes(q.toLowerCase()) ||
      i.description.toLowerCase().includes(q.toLowerCase()) ||
      i.reference.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  const open = (i: LegislationItem) =>
    i.fileUrl
      ? window.open(i.fileUrl, "_blank", "noopener,noreferrer")
      : toast.info(`"${i.title}" will be available shortly.`);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                cat === c
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:border-gold/50 hover:bg-secondary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search legislation…"
            className="pl-9"
            aria-label="Search legislation"
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((l) => (
          <div
            key={l.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
              <Scale className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-primary">{l.title}</h3>
                <Badge variant="secondary" className="rounded-md">{l.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {l.reference && <span>Reference: <strong className="text-foreground">{l.reference}</strong></span>}
                <span>Enacted: <strong className="text-foreground">{l.enactedYear}</strong></span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => open(l)}>
              {l.fileUrl ? <ExternalLink className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              View
            </Button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
          No legislation matches your search.
        </div>
      )}
    </div>
  );
}
