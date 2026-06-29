/**
 * Site-wide search.
 *
 * Aggregates every public content type (pages, news, publications, legislation,
 * tenders, FAQs, forms, reports) into a single ranked result set with optional
 * content-type and date-range filtering. Backed by the data access layer, so it
 * works against Supabase or seed data identically.
 */
import type { SearchResult, SearchResultType } from "@/lib/data/types";
import {
  getFaqs,
  getForms,
  getLegislation,
  getNews,
  getPublications,
  getReports,
  getTenders,
} from "@/lib/data/content";

export const SEARCH_TYPES: (SearchResultType | "All")[] = [
  "All",
  "Page",
  "News",
  "Publication",
  "Legislation",
  "Tender",
  "FAQ",
  "Form",
  "Report",
];

export type SearchFilters = {
  type?: SearchResultType | "All";
  from?: string; // ISO date (inclusive)
  to?: string; // ISO date (inclusive)
};

/** Static pages that should be discoverable via search. */
const STATIC_PAGES: SearchResult[] = [
  { id: "pg-home", type: "Page", title: "Home", excerpt: "Office of Workers Compensation — official portal.", href: "/" },
  { id: "pg-about", type: "Page", title: "About OWC", excerpt: "Mandate, functions, governance and the Ministry of Labour & Employment.", href: "/about" },
  { id: "pg-claims", type: "Page", title: "Claims", excerpt: "Lodge a claim, track a claim, required documents and FAQs.", href: "/claims" },
  { id: "pg-employers", type: "Page", title: "Employers", excerpt: "Register, obligations, report a workplace injury and the compensation process.", href: "/employers" },
  { id: "pg-reports", type: "Page", title: "Reports & Data", excerpt: "Injury and claims statistics, OHS resources and annual reports.", href: "/reports" },
  { id: "pg-contact", type: "Page", title: "Contact & Enquiry", excerpt: "Contact the Office of Workers Compensation and submit an enquiry.", href: "/contact" },
];

async function buildIndex(): Promise<SearchResult[]> {
  const [news, forms, reports, faqs, pubs, legis, tenders] = await Promise.all([
    getNews(),
    getForms(),
    getReports(),
    getFaqs(),
    getPublications(),
    getLegislation(),
    getTenders(),
  ]);

  return [
    ...STATIC_PAGES,
    ...news.map<SearchResult>((n) => ({
      id: n.id,
      type: "News",
      title: n.title,
      excerpt: n.excerpt,
      href: `/news/${n.slug}`,
      date: n.date,
    })),
    ...pubs.map<SearchResult>((p) => ({
      id: p.id,
      type: "Publication",
      title: p.title,
      excerpt: p.description,
      href: "/publications",
      date: p.year,
    })),
    ...legis.map<SearchResult>((l) => ({
      id: l.id,
      type: "Legislation",
      title: l.title,
      excerpt: l.description,
      href: "/legislation",
      date: l.enactedYear,
    })),
    ...tenders.map<SearchResult>((t) => ({
      id: t.id,
      type: "Tender",
      title: t.title,
      excerpt: t.description,
      href: "/tenders",
      date: t.publishedDate,
    })),
    ...faqs.map<SearchResult>((f) => ({
      id: f.id,
      type: "FAQ",
      title: f.q,
      excerpt: f.a,
      href: "/faqs",
    })),
    ...forms.map<SearchResult>((f) => ({
      id: f.id,
      type: "Form",
      title: `${f.code} — ${f.title}`,
      excerpt: `${f.category} form · ${f.format} · ${f.size}`,
      href: "/forms",
      date: f.updated,
    })),
    ...reports.map<SearchResult>((r) => ({
      id: r.id,
      type: "Report",
      title: r.title,
      excerpt: r.desc,
      href: "/reports",
      date: r.year,
    })),
  ];
}

function yearOf(date?: string): number | null {
  if (!date) return null;
  const m = date.match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

export async function searchAll(
  query: string,
  filters: SearchFilters = {},
): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  const index = await buildIndex();
  const fromY = yearOf(filters.from);
  const toY = yearOf(filters.to);

  return index
    .filter((r) => {
      if (filters.type && filters.type !== "All" && r.type !== filters.type) {
        return false;
      }
      if (fromY || toY) {
        const y = yearOf(r.date);
        if (y === null) return false;
        if (fromY && y < fromY) return false;
        if (toY && y > toY) return false;
      }
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Exact title matches first, then by recency.
      if (q) {
        const at = a.title.toLowerCase().startsWith(q) ? 1 : 0;
        const bt = b.title.toLowerCase().startsWith(q) ? 1 : 0;
        if (at !== bt) return bt - at;
      }
      return (yearOf(b.date) ?? 0) - (yearOf(a.date) ?? 0);
    });
}
