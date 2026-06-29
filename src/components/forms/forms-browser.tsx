"use client";

import { useMemo, useState } from "react";
import { Search, Download, FileText, FileType2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Claims", "Employer", "Medical", "Guidelines"] as const;

export function FormsBrowser({ forms }: { forms: FormItem[] }) {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return forms.filter((f) => {
      const matchCat = cat === "All" || f.category === cat;
      const matchQ =
        q.trim() === "" ||
        f.title.toLowerCase().includes(q.toLowerCase()) ||
        f.code.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [cat, q, forms]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const count =
              c === "All" ? forms.length : forms.filter((f) => f.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  cat === c
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-foreground hover:border-gold/50 hover:bg-secondary",
                )}
              >
                {c}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    cat === c ? "bg-white/20" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search forms…"
            className="pl-9"
            aria-label="Search forms"
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <FormCard key={f.code} form={f} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
          No forms match your search.
        </div>
      )}
    </div>
  );
}

function FormCard({ form }: { form: FormItem }) {
  const FormatIcon = form.format === "PDF" ? FileText : FileType2;
  const onDownload = () => {
    if (form.fileUrl) {
      window.open(form.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.info(`${form.code} — ${form.title} will be available shortly.`);
    }
  };
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
          <FormatIcon className="h-5 w-5" />
        </span>
        <Badge variant="gold" className="font-mono">{form.code}</Badge>
      </div>
      <h3 className="mt-4 flex-1 font-serif text-base font-bold leading-snug text-primary">
        {form.title}
      </h3>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="rounded-md">{form.category}</Badge>
        <span>·</span>
        <span>{form.format} · {form.size}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          Updated {new Date(form.updated).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
