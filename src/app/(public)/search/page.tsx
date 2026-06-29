import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowUpRight, SearchX } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { SearchControls } from "@/components/search/search-controls";
import { searchAll } from "@/lib/data/search";
import type { SearchResultType } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search across pages, news, publications, legislation, tenders, FAQs, forms and reports on the Office of Workers Compensation website.",
};

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : (v ?? "");

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = first(sp.q);
  const type = first(sp.type) || "All";
  const from = first(sp.from);
  const to = first(sp.to);

  const hasQuery = Boolean(q || (type && type !== "All") || from || to);
  const results = hasQuery
    ? await searchAll(q, {
        type: type as SearchResultType | "All",
        from,
        to,
      })
    : [];

  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Search the OWC website"
        subtitle="Find pages, news, publications, legislation, tenders, FAQs, forms and reports."
        breadcrumb={[{ label: "Search" }]}
      />

      <section className="py-12 lg:py-16">
        <div className="container-gov">
          <SearchControls
            defaultQuery={q}
            defaultType={type}
            defaultFrom={from}
            defaultTo={to}
          />

          {hasQuery && (
            <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
              {results.length} result{results.length === 1 ? "" : "s"}
              {q ? (
                <>
                  {" "}for <strong className="text-foreground">“{q}”</strong>
                </>
              ) : null}
              {type !== "All" ? <> in {type}</> : null}
            </p>
          )}

          {hasQuery && results.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 p-14 text-center">
              <SearchX className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 max-w-sm text-muted-foreground">
                No results found. Try different keywords or broaden your filters.
              </p>
            </div>
          )}

          {!hasQuery && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 p-14 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 max-w-sm text-muted-foreground">
                Enter a search term above to search across the entire OWC website.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <ul className="mt-8 space-y-3">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link
                    href={r.href}
                    className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
                  >
                    <Badge variant="navy" className="mt-0.5 shrink-0">
                      {r.type}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-base font-bold text-primary group-hover:text-gold">
                        {r.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {r.excerpt}
                      </p>
                      {r.date && (
                        <span className="mt-1 inline-block text-xs text-muted-foreground/70">
                          {r.date}
                        </span>
                      )}
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
