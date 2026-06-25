import Link from "next/link";
import type { Metadata } from "next";
import {
  Scale,
  Landmark,
  Users,
  ShieldCheck,
  FileText,
  HeartHandshake,
  ClipboardList,
  Gavel,
  Building2,
  ArrowRight,
  Target,
  Eye,
  Award,
  CheckCircle2,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { IMG, ORG } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About OWC",
  description:
    "Learn about the mandate, functions, governance and reporting structure of the Office of Workers Compensation under the Ministry of Labour and Employment, Papua New Guinea.",
};

const FUNCTIONS = [
  { icon: FileText, t: "Administer claims", d: "Receive, register, assess and determine workers compensation claims under the Act." },
  { icon: Gavel, t: "Determine entitlements", d: "Apply the statutory schedule to calculate fair compensation for injury, incapacity or death." },
  { icon: ClipboardList, t: "Register employers", d: "Maintain the register of employers and ensure compulsory insurance coverage." },
  { icon: ShieldCheck, t: "Enforce compliance", d: "Monitor and enforce employer obligations and investigate non-compliance." },
  { icon: HeartHandshake, t: "Support workers", d: "Guide injured workers and dependants through the compensation process." },
  { icon: Award, t: "Promote safety", d: "Advance occupational health and safety awareness across all industries." },
];

const GOVERNANCE = [
  { tier: "National Government", role: "Sets labour & employment policy direction", icon: Landmark },
  { tier: "Minister for Labour & Employment", role: "Political accountability to Parliament", icon: Gavel },
  { tier: "Department of Labour & Employment", role: "Departmental oversight & coordination", icon: Building2 },
  { tier: "Office of Workers Compensation", role: "Statutory administration of the Act 1978", icon: ShieldCheck },
  { tier: "Registrar & Tribunal", role: "Determinations, reviews & appeals", icon: Scale },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the Office"
        title="The statutory guardian of workers compensation in PNG"
        subtitle="The Office of Workers Compensation operates under the Workers Compensation Act 1978 within the Ministry of Labour and Employment."
        breadcrumb={[{ label: "About OWC" }]}
      />

      {/* Overview */}
      <section className="py-16 lg:py-20">
        <div className="container-gov grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="An institution built on fairness and accountability"
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                The Office of Workers Compensation (OWC) is the national
                authority responsible for administering the workers compensation
                system of Papua New Guinea. We serve as the bridge between
                injured workers seeking support and the employers responsible for
                their wellbeing.
              </p>
              <p>
                Operating under the {ORG.act}, the Office ensures that every
                eligible worker — and the dependants of workers who lose their
                lives at work — receives just and timely compensation, while
                upholding the integrity and sustainability of the scheme.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <Target className="mb-3 h-6 w-6 text-gold" />
                <h3 className="font-serif text-lg font-bold text-primary">Our Mission</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  To deliver fair, efficient and transparent workers compensation
                  services that protect PNG's workforce.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <Eye className="mb-3 h-6 w-6 text-gold" />
                <h3 className="font-serif text-lg font-bold text-primary">Our Vision</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Safe, productive workplaces where every worker is protected and
                  valued.
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
              <img
                src={IMG.harbour}
                alt="View over Port Moresby, the capital of Papua New Guinea"
                className="h-[480px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mandate */}
      <section id="mandate" className="scroll-mt-28 border-y border-border bg-primary py-16 text-white lg:py-20">
        <div className="container-gov grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading light eyebrow="Our mandate" title="Authority under the Workers Compensation Act 1978" />
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg leading-relaxed text-white/80">
              The Office derives its powers and responsibilities directly from
              the Workers Compensation Act 1978. The Act establishes the legal
              framework for:
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Compulsory employer insurance",
                "Compensation for work-related injury",
                "Benefits for permanent incapacity",
                "Dependant entitlements for fatal injury",
                "Medical and rehabilitation expenses",
                "Dispute resolution and appeals",
              ].map((m) => (
                <li key={m} className="flex items-start gap-2.5 rounded-lg bg-white/5 p-3.5 text-sm text-white/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Functions */}
      <section id="functions" className="scroll-mt-28 py-16 lg:py-24">
        <div className="container-gov">
          <SectionHeading
            align="center"
            eyebrow="Functions & responsibilities"
            title="What the Office delivers"
            description="Our work spans the full lifecycle of workers compensation — from employer registration to the final determination of a claim."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FUNCTIONS.map((f) => (
              <div key={f.t} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-lg font-bold text-primary">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance */}
      <section id="governance" className="scroll-mt-28 border-y border-border bg-secondary/60 py-16 lg:py-24">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Governance & structure"
            title="Clear lines of accountability"
            description="The Office operates within a transparent reporting structure that ensures accountability to the people of Papua New Guinea."
          />
          <div className="mt-12 space-y-3">
            {GOVERNANCE.map((g, i) => (
              <div key={g.tier} className="flex items-center gap-4">
                <div className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
                    <g.icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <div className="font-serif text-base font-bold text-primary">{g.tier}</div>
                    <div className="text-sm text-muted-foreground">{g.role}</div>
                  </div>
                  <span className="hidden font-serif text-3xl font-bold text-secondary sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ministry connection */}
      <section id="ministry" className="scroll-mt-28 py-16 lg:py-24">
        <div className="container-gov grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <Landmark className="h-10 w-10 text-gold" />
              <h3 className="mt-4 font-serif text-2xl font-bold text-primary">
                {ORG.ministry}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                The Office of Workers Compensation sits within the Ministry of
                Labour and Employment, which leads national policy on employment,
                industrial relations, workplace safety and labour standards.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                This connection ensures that workers compensation is administered
                in step with the broader goals of a fair, safe and productive
                labour market for Papua New Guinea.
              </p>
              <Button asChild variant="default" className="mt-6">
                <Link href="/contact">
                  Get in touch <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="The Ministry"
              title="Part of a national commitment to PNG's workers"
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                As an agency of the Ministry, the OWC contributes to the
                Government's vision of empowering citizens through safe and
                dignified work. We collaborate with departments, industry bodies
                and provincial administrations nationwide.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { v: "22", l: "Provinces served" },
                { v: "8,640", l: "Employers registered" },
                { v: "1978", l: "Established by Act" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-secondary/50 p-4 text-center">
                  <div className="font-serif text-2xl font-bold text-primary">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-flag-diag py-16 text-white">
        <div className="container-gov">
          <SectionHeading light align="center" eyebrow="Our values" title="The principles that guide us" />
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scale, t: "Fairness" },
              { icon: ShieldCheck, t: "Integrity" },
              { icon: Users, t: "Service" },
              { icon: Award, t: "Excellence" },
            ].map((v) => (
              <div key={v.t} className="flex flex-col items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-6 text-center">
                <v.icon className="h-8 w-8 text-gold" />
                <span className="font-serif text-lg font-bold">{v.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
