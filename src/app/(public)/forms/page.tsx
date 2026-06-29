import Link from "next/link";
import type { Metadata } from "next";
import { FileText, ShieldCheck, Megaphone, ArrowRight } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { FormsBrowser } from "@/components/forms/forms-browser";
import { getForms } from "@/lib/data/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Forms & Downloads",
  description:
    "Download claim forms, employer forms, medical report forms, guidelines and public notices from the Office of Workers Compensation.",
};

export default async function FormsPage() {
  const forms = await getForms();
  return (
    <>
      <PageHero
        eyebrow="Forms & Downloads"
        title="Forms, guidelines and public notices"
        subtitle="Access every official OWC form and publication in one place — for workers, employers and medical practitioners."
        breadcrumb={[{ label: "Forms" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Document library"
            title="Find the form you need"
            description="Filter by category or search by name and code. All documents are official OWC publications."
          />
          <div className="mt-10">
            <FormsBrowser forms={forms} />
          </div>
        </div>
      </section>

      {/* Help band */}
      <section className="border-t border-border bg-secondary/60 py-14">
        <div className="container-gov grid gap-6 md:grid-cols-3">
          {[
            {
              icon: FileText,
              t: "How to complete forms",
              d: "Step-by-step guides for filling out claim and employer forms.",
              href: "/claims#documents",
              cta: "View guidance",
            },
            {
              icon: Megaphone,
              t: "Public notices",
              d: "Read the latest public notices and awareness announcements.",
              href: "/news",
              cta: "Read notices",
            },
            {
              icon: ShieldCheck,
              t: "Submit securely",
              d: "Lodge completed forms and documents through our secure portal.",
              href: "/claims#lodge",
              cta: "Lodge online",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-6">
              <c.icon className="h-8 w-8 text-gold" />
              <h3 className="mt-3 font-serif text-lg font-bold text-primary">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              <Button asChild variant="ghost" size="sm" className="mt-3 px-0 text-primary hover:bg-transparent hover:text-gold">
                <Link href={c.href}>{c.cta} <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
