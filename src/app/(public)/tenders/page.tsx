import type { Metadata } from "next";
import { Gavel, Mail } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { TendersBrowser } from "@/components/resources/tenders-browser";
import { getTenders } from "@/lib/data/content";
import { ORG } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tenders & Procurement",
  description:
    "Current and past tender opportunities, requests for proposals and procurement notices from the Office of Workers Compensation.",
};

export default async function TendersPage() {
  const tenders = await getTenders();
  return (
    <>
      <PageHero
        eyebrow="Procurement"
        title="Tenders & procurement opportunities"
        subtitle="Current and recent requests for tender issued by the Office of Workers Compensation."
        breadcrumb={[{ label: "Tenders" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Opportunities"
            title="Open & recent tenders"
            description="Filter by status or search by reference and title. Submissions must follow the instructions in each tender document."
          />
          <div className="mt-10">
            <TendersBrowser items={tenders} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60 py-14">
        <div className="container-gov grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <Gavel className="h-8 w-8 text-gold" />
            <h3 className="mt-3 font-serif text-lg font-bold text-primary">
              How to submit a tender
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Download the tender document, prepare your submission in line with
              the requirements, and lodge it before the closing date. Late or
              incomplete submissions will not be considered.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6">
            <Mail className="h-8 w-8 text-gold" />
            <h3 className="mt-3 font-serif text-lg font-bold text-primary">
              Procurement enquiries
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              For questions about a tender, contact our procurement team at{" "}
              <a href={`mailto:${ORG.email}`} className="font-semibold text-primary hover:text-gold">
                {ORG.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
