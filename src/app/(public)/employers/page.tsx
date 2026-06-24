import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  CalendarClock,
  BadgeCheck,
  Scale,
  Banknote,
  ArrowRight,
  Phone,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Employer Services",
  description:
    "Employer registration, legal obligations, workplace injury reporting and the compensation process under the Workers Compensation Act 1978.",
};

const REGISTER_STEPS = [
  { t: "Complete EMP-1", d: "Lodge the Employer Registration Application with your business details." },
  { t: "Arrange insurance", d: "Take out a workers compensation insurance policy as required by law." },
  { t: "Submit wage details", d: "Provide your annual wages declaration for assessment." },
  { t: "Receive registration", d: "Obtain your OWC employer registration confirmation." },
];

const OBLIGATIONS = [
  { icon: ShieldCheck, t: "Maintain insurance", d: "Hold a current workers compensation insurance policy for all workers." },
  { icon: AlertTriangle, t: "Report injuries", d: "Notify OWC of any workplace injury or illness within 7 days." },
  { icon: ClipboardCheck, t: "Keep records", d: "Maintain accurate records of wages, injuries and compensation." },
  { icon: BadgeCheck, t: "Display information", d: "Make workers aware of their compensation rights." },
  { icon: Banknote, t: "Pay premiums", d: "Keep policy premiums and wage declarations up to date." },
  { icon: Scale, t: "Cooperate with OWC", d: "Assist with the assessment and determination of claims." },
];

const PROCESS = [
  { t: "Injury occurs", d: "A worker is injured in the course of employment." },
  { t: "Employer notified", d: "The worker reports the injury to the employer." },
  { t: "Report to OWC", d: "Employer submits the Employer's Report of Injury (EMP-2) within 7 days." },
  { t: "Claim lodged", d: "The worker (or employer on their behalf) lodges the claim." },
  { t: "Assessment", d: "OWC reviews medical and employment evidence." },
  { t: "Determination & payment", d: "Compensation is determined and paid in accordance with the Act." },
];

export default function EmployersPage() {
  return (
    <>
      <PageHero
        eyebrow="Employer Services"
        title="Supporting employers to protect their workforce"
        subtitle="Register your business, understand your obligations, report workplace injuries and follow the compensation process with confidence."
        breadcrumb={[{ label: "Employers" }]}
      />

      {/* Register */}
      <section id="register" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-gov grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Registration"
              title="Register as an employer"
              description="Every employer in Papua New Guinea must be registered and maintain workers compensation insurance for their employees under the Act."
            />
            <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-6">
              <Building2 className="h-8 w-8 text-gold" />
              <h3 className="mt-3 font-serif text-lg font-bold text-primary">
                New to OWC?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Download the Employer Registration Application (EMP-1) to begin.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="gold">
                  <Link href="/forms">Get EMP-1 form <ArrowRight /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Ask a question</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ol className="grid gap-4 sm:grid-cols-2">
              {REGISTER_STEPS.map((s, i) => (
                <li key={s.t} className="relative rounded-2xl border border-border bg-card p-6">
                  <span className="absolute right-4 top-3 font-serif text-3xl font-bold text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-base font-bold text-primary">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Obligations */}
      <section id="obligations" className="scroll-mt-28 border-y border-border bg-secondary/60 py-16 lg:py-24">
        <div className="container-gov">
          <SectionHeading
            align="center"
            eyebrow="Your duties"
            title="Employer obligations under the Act"
            description="Meeting these obligations keeps your workers protected and your business compliant."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {OBLIGATIONS.map((o) => (
              <div key={o.t} className="rounded-2xl border border-border bg-card p-6">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-white">
                  <o.icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-lg font-bold text-primary">{o.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report an injury */}
      <section id="report" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-gov grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Workplace injury reporting"
              title="Report an injury within 7 days"
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                The law requires employers to notify the Office of Workers
                Compensation of any workplace injury, illness or death within{" "}
                <strong className="text-foreground">seven (7) days</strong> of
                becoming aware of it.
              </p>
              <p>
                Prompt reporting protects your worker's entitlements and helps
                ensure your claim is processed without delay.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="default">
                <Link href="/forms">Download EMP-2 <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline">
                <a href="tel:+6753211299"><Phone /> Report by phone</a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-destructive text-white">
                <CalendarClock className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl font-bold text-primary">
                What to report
              </h3>
            </div>
            <ul className="mt-5 space-y-3">
              {[
                "Date, time and location of the incident",
                "Nature and cause of the injury",
                "The worker's details and occupation",
                "Any first-aid or medical treatment given",
                "Names of any witnesses",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Compensation process */}
      <section id="process" className="scroll-mt-28 border-t border-border bg-primary py-16 text-white lg:py-24">
        <div className="container-gov">
          <SectionHeading
            light
            align="center"
            eyebrow="Compensation process"
            title="From injury to determination"
            description="Understanding the process helps employers support their workers every step of the way."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PROCESS.map((p, i) => (
              <div key={p.t} className="relative rounded-2xl border border-white/15 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold font-serif text-base font-bold text-gold-foreground">
                    {i + 1}
                  </span>
                  <h3 className="font-serif text-base font-bold text-white">{p.t}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{p.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
            <UserCheck className="h-9 w-9 text-gold" />
            <h3 className="font-serif text-xl font-bold">Already registered?</h3>
            <p className="max-w-lg text-white/70">
              Manage your reporting and access employer forms, or speak with our
              employer services team for tailored guidance.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold">
                <Link href="/forms">Employer forms <FileText /></Link>
              </Button>
              <Button asChild variant="outline-light">
                <Link href="/contact">Contact employer services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
