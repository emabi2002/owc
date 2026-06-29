import type { Metadata } from "next";
import { Library, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { PublicationsBrowser } from "@/components/resources/publications-browser";
import { getPublications } from "@/lib/data/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Annual reports, statistical bulletins, guides, handbooks and strategic publications from the Office of Workers Compensation.",
};

export default async function PublicationsPage() {
  const publications = await getPublications();
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Publications & downloads"
        subtitle="Annual reports, statistical bulletins, guides and strategic publications from the Office of Workers Compensation."
        breadcrumb={[{ label: "Publications" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Document library"
            title="Browse OWC publications"
            description="Filter by category or search by title. All documents are official OWC publications."
          />
          <div className="mt-10">
            <PublicationsBrowser items={publications} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60 py-14">
        <div className="container-gov flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-8 text-center md:flex-row md:text-left">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
              <Library className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">
                Looking for legislation or forms?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse the Acts and regulations, or download official OWC forms.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/legislation">Legislation <ArrowRight /></Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/forms">Forms <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
