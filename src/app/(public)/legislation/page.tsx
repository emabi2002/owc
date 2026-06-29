import type { Metadata } from "next";
import { Scale, ShieldCheck } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { LegislationBrowser } from "@/components/resources/legislation-browser";
import { getLegislation } from "@/lib/data/content";
import { ORG } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Legislation",
  description:
    "Acts, regulations, schedules and statutory instruments governing workers compensation in Papua New Guinea, including the Workers Compensation Act 1978.",
};

export default async function LegislationPage() {
  const legislation = await getLegislation();
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Legislation & statutory instruments"
        subtitle="The legal framework that governs workers compensation in Papua New Guinea."
        breadcrumb={[{ label: "Legislation" }]}
      />

      <section className="border-b border-border bg-card">
        <div className="container-gov flex items-start gap-4 py-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Office of Workers Compensation administers the{" "}
            <strong className="text-foreground">{ORG.act}</strong> and related
            subordinate legislation. The documents below are provided for
            information; always refer to the official gazetted versions for legal
            purposes.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Legal library"
            title="Acts, regulations & schedules"
            description="Filter by category or search by title and reference."
          />
          <div className="mt-10">
            <LegislationBrowser items={legislation} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-flag-diag py-14 text-white">
        <div className="container-gov flex flex-col items-center gap-3 text-center">
          <Scale className="h-9 w-9 text-gold" />
          <h2 className="font-serif text-2xl font-bold">Need legal clarification?</h2>
          <p className="max-w-xl text-white/75">
            For interpretation of the Act or regulations, contact the Office of
            Workers Compensation for guidance.
          </p>
        </div>
      </section>
    </>
  );
}
