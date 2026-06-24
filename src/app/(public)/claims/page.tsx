import type { Metadata } from "next";
import {
  Banknote,
  Clock,
  ShieldCheck,
  FileText,
  Stethoscope,
  IdCard,
  Receipt,
  Camera,
  Users,
  HelpCircle,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LodgeForm } from "@/components/claims/lodge-form";
import { ClaimTracker } from "@/components/claims/claim-tracker";
import { CLAIM_FAQS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Claims Services",
  description:
    "Lodge a workers compensation claim online, track an existing claim, see the documents you need, and read frequently asked questions for injured workers and employers.",
};

const DOCS = [
  { icon: FileText, t: "Completed claim form (WC-1)", d: "The Worker's Application for Compensation." },
  { icon: Stethoscope, t: "Medical first report (MED-1)", d: "Completed by your treating doctor." },
  { icon: IdCard, t: "Proof of identity", d: "National ID, passport or driver's licence." },
  { icon: Receipt, t: "Evidence of wages", d: "Recent payslips or an employer wage statement." },
  { icon: Camera, t: "Incident evidence", d: "Photographs or witness statements, if available." },
  { icon: Users, t: "Dependant details", d: "For fatal-injury claims by dependants." },
];

export default function ClaimsPage() {
  return (
    <>
      <PageHero
        eyebrow="Claims Services"
        title="Lodge, track and manage your compensation claim"
        subtitle="Everything an injured worker or employer needs to make a workers compensation claim — securely and online."
        breadcrumb={[{ label: "Claims" }]}
      />

      {/* Key facts */}
      <section className="border-b border-border bg-card">
        <div className="container-gov grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Banknote, t: "Free to lodge", d: "There is never a charge to submit a claim." },
            { icon: Clock, t: "Faster determinations", d: "Most claims assessed within 30–45 days." },
            { icon: ShieldCheck, t: "Secure & confidential", d: "Encrypted handling of all your information." },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-4 py-5 sm:px-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-serif text-base font-bold text-primary">{f.t}</div>
                <div className="text-sm text-muted-foreground">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lodge */}
      <section id="lodge" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Lodge a claim"
            title="Online workers compensation claim"
            description="Complete the secure form below. Fields marked with an asterisk are required. You can save supporting documents directly with your claim."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <LodgeForm />
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-4">
                <div className="rounded-2xl border border-border bg-secondary/50 p-6">
                  <h3 className="font-serif text-lg font-bold text-primary">
                    Before you start
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {[
                      "Have your employer's details ready",
                      "Know the date and time of the injury",
                      "Prepare your medical report (MED-1)",
                      "Have digital copies of documents to upload",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6">
                  <HelpCircle className="h-7 w-7 text-gold" />
                  <h3 className="mt-3 font-serif text-lg font-bold text-primary">
                    Need help lodging?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our officers can assist you in person or by phone during
                    business hours.
                  </p>
                  <a
                    href="tel:+6753211200"
                    className="mt-3 inline-block font-semibold text-primary hover:text-gold"
                  >
                    +675 321 1200
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Track */}
      <section id="track" className="scroll-mt-28 border-y border-border bg-secondary/60 py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Track a claim"
            title="Claim enquiry & tracking"
            description="Follow your claim from lodgement to determination using your reference number."
          />
          <div className="mt-10">
            <ClaimTracker />
          </div>
        </div>
      </section>

      {/* Required documents */}
      <section id="documents" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Required documents"
            title="What you'll need to provide"
            description="Having these documents ready will help us assess your claim quickly and accurately."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {DOCS.map((d) => (
              <div key={d.t} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                  <d.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-bold text-primary">{d.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="scroll-mt-28 border-t border-border bg-secondary/60 py-16 lg:py-24">
        <div className="container-gov grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="FAQs"
              title="Answers for workers & employers"
              description="Common questions about the workers compensation claims process."
            />
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="space-y-3">
              {CLAIM_FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-gold/50"
                >
                  <AccordionTrigger className="text-left font-serif text-base font-semibold text-primary hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
