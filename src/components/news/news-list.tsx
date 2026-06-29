"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function NewsList({ items }: { items: NewsItem[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((n) => n.category)))],
    [items],
  );
  const [cat, setCat] = useState("All");

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
        No news articles are available at this time.
      </div>
    );
  }

  const featured = items.find((n) => n.featured) ?? items[0];
  const rest = items.filter((n) => n.slug !== featured.slug);
  const filtered = cat === "All" ? rest : rest.filter((n) => n.category === cat);

  return (
    <div>
      {/* Featured */}
      {cat === "All" && (
        <Link
          href={`/news/${featured.slug}`}
          className="group mb-12 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg lg:grid-cols-2"
        >
          <div className="relative h-64 overflow-hidden lg:h-auto">
            <img
              src={featured.image}
              alt={featured.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <Badge variant="gold" className="absolute left-4 top-4 bg-white/90 text-primary">
              Featured · {featured.category}
            </Badge>
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-10">
            <time className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> {fmt(featured.date)}
            </time>
            <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-primary group-hover:text-gold lg:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
              Read full story
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
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

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <Link
            key={n.slug}
            href={`/news/${n.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={n.image}
                alt={n.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Badge variant="gold" className="absolute left-3 top-3 bg-white/90 text-primary">
                {n.category}
              </Badge>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <time className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {fmt(n.date)}
              </time>
              <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-primary group-hover:text-gold">
                {n.title}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {n.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                Read more
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
