import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft, ArrowRight, Share2, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORG } from "@/lib/site-data";
import { getNews, getNewsBySlug, getNewsSlugs } from "@/lib/data/content";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const allNews = await getNews();
  const related = allNews.filter((n) => n.slug !== slug).slice(0, 3);

  return (
    <article>
      <header className="relative overflow-hidden bg-flag-diag text-white">
        <div className="absolute inset-0 bg-grid-faint opacity-30" aria-hidden />
        <div className="container-gov relative py-12 lg:py-16">
          <Link href="/news" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back to news
          </Link>
          <Badge variant="gold" className="mb-4 bg-white/10 text-gold ring-gold/40">
            {article.category}
          </Badge>
          <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight md:text-[2.6rem]">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gold" /> {fmt(article.date)}
            </span>
            <span>Office of Workers Compensation</span>
          </div>
        </div>
      </header>

      <div className="container-gov grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <img src={article.image} alt={article.title} className="h-[360px] w-full object-cover" />
          </div>

          <div className="prose-gov mt-8 text-[16px] leading-relaxed text-foreground/90">
            {article.excerpt && (
              <p className="mb-5 text-lg font-medium text-foreground">{article.excerpt}</p>
            )}
            {article.body ? (
              <div dangerouslySetInnerHTML={{ __html: article.body }} />
            ) : (
              <div className="space-y-5">
                <p>
                  The Office of Workers Compensation continues to strengthen the
                  services it provides to injured workers, dependants and employers
                  across Papua New Guinea. This initiative reflects the Office&apos;s
                  commitment to administering the {ORG.act} fairly, efficiently and
                  transparently.
                </p>
                <p>
                  Workers and employers are encouraged to use the online services
                  available on this portal, including lodging and tracking claims,
                  downloading official forms, and contacting the Office directly.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
            <span className="text-sm font-medium text-muted-foreground">Share:</span>
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline" size="sm"><Printer className="h-4 w-4" /> Print</Button>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-serif text-lg font-bold text-primary">Related news</h3>
              <ul className="mt-4 space-y-4">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/news/${r.slug}`} className="group flex gap-3">
                      <img src={r.image} alt={r.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          {r.category}
                        </div>
                        <div className="text-sm font-semibold leading-snug text-foreground group-hover:text-gold">
                          {r.title}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6">
              <h3 className="font-serif text-lg font-bold text-primary">Need assistance?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Contact the Office of Workers Compensation for help with claims or enquiries.
              </p>
              <Button asChild variant="default" size="sm" className="mt-4">
                <Link href="/contact">Contact us <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
