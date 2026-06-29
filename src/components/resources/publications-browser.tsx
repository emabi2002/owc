"use client";

import { useMemo, useState } from "react";
import { Search, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublicationItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function PublicationsBrowser({ items }: { items: PublicationItem[] }) {
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
      i.description.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  const download = (i: PublicationItem) =>
    i.fileUrl
      ? window.open(i.fileUrl, "_blank", "noopener,noreferrer")
      : toast.info(`"${i.title}" will be available for download shortly.`);

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
            placeholder="Search publications…"
            className="pl-9"
            aria-label="Search publications"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white">
                <FileText className="h-6 w-6" />
              </span>
              <Badge variant="navy">{p.year}</Badge>
            </div>
            <Badge variant="secondary" className="mt-4 w-fit rounded-md">{p.category}</Badge>
            <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-primary">
              {p.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {p.format} · {p.size}
              </span>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => download(p)}>
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
          No publications match your search.
        </div>
      )}
    </div>
  );
}
