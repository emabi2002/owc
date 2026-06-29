"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function FaqsBrowser({ items }: { items: FaqItem[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const filtered = items.filter((f) => {
    const matchCat = cat === "All" || f.category === cat;
    const matchQ =
      q.trim() === "" ||
      f.q.toLowerCase().includes(q.toLowerCase()) ||
      f.a.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

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
            placeholder="Search questions…"
            className="pl-9"
            aria-label="Search frequently asked questions"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {filtered.map((f) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-gold/50"
            >
              <AccordionTrigger className="text-left font-serif text-base font-semibold text-primary hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
          No questions match your search.
        </div>
      )}
    </div>
  );
}
