import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { FaqsBrowser } from "@/components/resources/faqs-browser";
import { getFaqs } from "@/lib/data/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about workers compensation claims, employer obligations, payments and contacting the Office of Workers Compensation.",
};

export default async function FaqsPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHero
        eyebrow="Help & support"
        title="Frequently asked questions"
        subtitle="Quick answers for injured workers, employers and the public — covering claims, obligations, payments and more."
        breadcrumb={[{ label: "FAQs" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Knowledge base"
            title="Find an answer"
            description="Filter by topic or search across every question. Can't find what you need? Contact us directly."
          />
          <div className="mt-10">
            <FaqsBrowser items={faqs} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60 py-14">
        <div className="container-gov flex flex-col items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/10 p-8 text-center md:flex-row md:text-left">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
              <HelpCircle className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">
                Still have a question?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our officers are ready to help with claims and enquiries.
              </p>
            </div>
          </div>
          <Button asChild variant="default">
            <Link href="/contact">Contact OWC <ArrowRight /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
