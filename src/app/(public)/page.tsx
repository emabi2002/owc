import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Search,
  Building2,
  Download,
  ShieldCheck,
  HeartPulse,
  Scale,
  ClipboardCheck,
  HardHat,
  Megaphone,
  Lock,
  FileCheck2,
  BadgeCheck,
  Banknote,
  ArrowUpRight,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/page-hero";
import { BirdOfParadise, NationalEmblem } from "@/components/owc-emblem";
import { QUICK_LINKS, STAT_HIGHLIGHTS, ORG, IMG } from "@/lib/site-data";
import { getNews } from "@/lib/data/content";

export const revalidate = 60;

const ICONS: Record<string, React.ElementType> = {
  FileText,
  Search,
  Building2,
  Download,
};

const NOTICES = [
  "Employer policy renewal period now open — renew before 31 July 2026",
  "New online claims portal is live across all provinces",
  "National OHS Awareness Week briefings begin 4 June 2026",
  "Public consultation on the Workers Compensation Act is open for submissions",
];

export default async function HomePage() {
  const news = await getNews();
  return (
    <>
      {/* Notice ticker */}
      <div className="flex items-stretch overflow-hidden border-b border-gold/30 bg-gold/10">
        <div className="flex shrink-0 items-center gap-2 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold-foreground">
          <Megaphone className="h-4 w-4" />
          <span className="hidden sm:inline">Public Notices</span>
        </div>
        <div className="relative flex flex-1 items-center overflow-hidden">
          <div className="animate-ticker flex shrink-0 items-center gap-12 whitespace-nowrap pl-6 text-sm text-primary">
            {[...NOTICES, ...NOTICES].map((n, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-flag-diag text-white">
        <div className="absolute inset-0 bg-grid-faint opacity-40" aria-hidden />
        <BirdOfParadise
          className="pointer-events-none absolute -left-24 top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 opacity-[0.05] lg:block"
          plumeColor="white"
          birdColor="white"
        />
        <div className="container-gov relative grid gap-10 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <Badge variant="gold" className="mb-5 bg-white/10 text-gold ring-gold/40">
              {ORG.act}
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.4rem]">
              Protecting the workers who{" "}
              <span className="text-gold">build Papua New Guinea</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              The Office of Workers Compensation administers fair, timely and
              transparent compensation for workers injured in the course of their
              employment — and supports employers to meet their obligations under
              the law.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="xl">
                <Link href="/claims#lodge">
                  Lodge a Claim <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="xl">
                <Link href="/claims#track">
                  <Search /> Track a Claim
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Secure &amp; encrypted
              </span>
              <span className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-gold" /> Free to lodge
              </span>
              <span className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gold" /> Statutory authority
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
                <img
                  src={IMG.heroWorker}
                  alt="Dock workers in hi-vis vests and hard hats on the Port Moresby waterfront, Papua New Guinea"
                  className="h-[420px] w-full object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 hidden w-60 rounded-xl border border-border bg-white p-4 text-foreground shadow-xl sm:block">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 text-success" /> Claims determined 2025
                </div>
                <div className="mt-1 font-serif text-3xl font-bold text-primary">
                  11,037
                </div>
                <div className="text-xs text-success">+8.1% on prior year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="relative z-10 -mt-8">
        <div className="container-gov">
          <div className="grid gap-4 rounded-2xl border border-border bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
            {QUICK_LINKS.map((q) => {
              const Icon = ICONS[q.icon] ?? FileText;
              return (
                <Link
                  key={q.title}
                  href={q.href}
                  className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-lg font-bold text-primary">
                    {q.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {q.desc}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                    Get started
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Welcome / role under the Act */}
      <section className="py-16 lg:py-24">
        <div className="container-gov grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
              <img
                src={IMG.harbour}
                alt="View over Port Moresby, the capital of Papua New Guinea"
                className="h-[440px] w-full object-cover"
              />
            </div>
            <div className="absolute -right-5 -top-5 hidden rounded-xl bg-primary p-5 text-white shadow-xl md:block">
              <Scale className="mb-2 h-7 w-7 text-gold" />
              <div className="font-serif text-2xl font-bold">Since 1978</div>
              <div className="text-xs text-white/70">Workers Compensation Act</div>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Welcome from the OWC"
              title="A fair and dependable safety net for every PNG worker"
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                On behalf of the Office of Workers Compensation, welcome to our
                official portal. Established under the{" "}
                <strong className="text-foreground">Workers Compensation Act 1978</strong>,
                our Office is the statutory authority responsible for the
                administration of workers compensation throughout Papua New
                Guinea.
              </p>
              <p>
                We exist to ensure that workers who suffer injury, illness or
                death arising from their employment — and their dependants —
                receive the compensation and support they are entitled to, fairly
                and without unnecessary delay. We also work alongside employers to
                build a culture of safe, compliant and productive workplaces.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: HeartPulse, text: "Support for injured workers & dependants" },
                { icon: Scale, text: "Fair, lawful determination of claims" },
                { icon: HardHat, text: "Safer workplaces across all industries" },
                { icon: ClipboardCheck, text: "Employer registration & compliance" },
              ].map((f) => (
                <div key={f.text} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5">
                  <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <span className="text-sm font-medium text-foreground">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-4 border-t border-border pt-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary font-serif text-lg font-bold text-primary">
                RC
              </div>
              <div>
                <div className="font-serif text-base font-bold text-primary">
                  Office of the Registrar
                </div>
                <div className="text-sm text-muted-foreground">
                  Office of Workers Compensation
                </div>
              </div>
              <Button asChild variant="ghost" className="ml-auto hidden text-primary sm:inline-flex">
                <Link href="/about">
                  About OWC <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Audience split: Workers / Employers */}
      <section className="border-y border-border bg-secondary/60 py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            align="center"
            eyebrow="Who we serve"
            title="Tailored services for workers and employers"
            description="Whether you have been injured at work or you employ people in Papua New Guinea, the OWC has dedicated services and clear guidance for you."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* Workers */}
            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex items-center gap-3 border-b border-border bg-primary p-6 text-white">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <Stethoscope className="h-6 w-6 text-gold" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold">For Injured Workers</h3>
                  <p className="text-sm text-white/70">Claim what you are entitled to</p>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {[
                  { t: "Lodge a compensation claim", h: "/claims#lodge" },
                  { t: "Upload your medical & supporting documents", h: "/claims#documents" },
                  { t: "Track your claim status online", h: "/claims#track" },
                  { t: "Read FAQs for injured workers", h: "/claims#faqs" },
                ].map((i) => (
                  <li key={i.t}>
                    <Link href={i.h} className="flex items-center justify-between gap-3 px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                      {i.t}
                      <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Employers */}
            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex items-center gap-3 border-b border-border bg-navy-deep p-6 text-white">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <Users className="h-6 w-6 text-gold" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold">For Employers</h3>
                  <p className="text-sm text-white/70">Stay registered and compliant</p>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {[
                  { t: "Register your business with OWC", h: "/employers#register" },
                  { t: "Understand your legal obligations", h: "/employers#obligations" },
                  { t: "Report a workplace injury", h: "/employers#report" },
                  { t: "Follow the compensation process", h: "/employers#process" },
                ].map((i) => (
                  <li key={i.t}>
                    <Link href={i.h} className="flex items-center justify-between gap-3 px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                      {i.t}
                      <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Claim process */}
      <section className="py-16 lg:py-24">
        <div className="container-gov">
          <SectionHeading
            eyebrow="How it works"
            title="Lodging a claim in four simple steps"
            description="Our process is designed to be clear and accessible — from reporting an injury to receiving your determination."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", icon: Megaphone, t: "Report the injury", d: "Notify your employer and ensure the workplace incident is recorded." },
              { n: "02", icon: FileText, t: "Lodge your claim", d: "Complete the online claim form and provide your employment details." },
              { n: "03", icon: FileCheck2, t: "Submit documents", d: "Upload medical reports and supporting evidence securely." },
              { n: "04", icon: BadgeCheck, t: "Determination", d: "OWC assesses your claim and confirms your entitlements." },
            ].map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
                <span className="absolute right-5 top-4 font-serif text-4xl font-bold text-secondary">
                  {s.n}
                </span>
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-white">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-lg font-bold text-primary">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                {i < 3 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-gold lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics band */}
      <section className="relative overflow-hidden bg-primary py-14 text-white">
        <BirdOfParadise
          className="pointer-events-none absolute -right-16 -bottom-20 h-80 w-80 opacity-[0.06]"
          plumeColor="white"
          birdColor="white"
        />
        <div className="container-gov relative">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              light
              eyebrow="Our impact"
              title="Workers compensation by the numbers"
              description="A snapshot of OWC activity for the 2025 reporting period."
            />
            <Button asChild variant="gold">
              <Link href="/reports">
                View all reports <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_HIGHLIGHTS.map((s) => (
              <div key={s.label} className="bg-primary p-6">
                <div className="font-serif text-4xl font-bold text-gold">{s.value}</div>
                <div className="mt-2 text-sm text-white/75">{s.label}</div>
                <div className="mt-1 text-xs font-medium text-white/55">{s.trend} YoY</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="py-16 lg:py-24">
        <div className="container-gov">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Newsroom"
              title="News & public notices"
              description="Stay informed with the latest announcements, awareness campaigns and labour updates."
            />
            <Button asChild variant="outline">
              <Link href="/news">
                All news <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {news.slice(0, 3).map((n) => (
              <Link
                key={n.slug}
                href={`/news/${n.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={n.image}
                    alt={n.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge variant="gold" className="absolute left-3 top-3 bg-white/90 text-primary backdrop-blur">
                    {n.category}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <time className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {new Date(n.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                  <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-primary group-hover:text-gold">
                    {n.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {n.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                    Read more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Security & compliance band */}
      <section className="border-y border-border bg-secondary/60 py-16">
        <div className="container-gov grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Security & compliance"
              title="Your information is protected"
              description="This portal is built to meet PNG Government ICT, DICT, NICTA and national cybersecurity expectations."
            />
            <Button asChild variant="default" className="mt-6">
              <Link href="/contact">
                Contact our team <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {[
              { icon: Lock, t: "Encrypted submissions", d: "Claim data is encrypted in transit and at rest." },
              { icon: ShieldCheck, t: "Secure authentication", d: "Role-based access protects every record." },
              { icon: FileCheck2, t: "Full audit trail", d: "Every change is logged for accountability." },
              { icon: BadgeCheck, t: "Standards aligned", d: "Compliant with national ICT & data policy." },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-border bg-card p-5">
                <c.icon className="mb-3 h-6 w-6 text-gold" />
                <h3 className="font-serif text-base font-bold text-primary">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-flag-diag py-16 text-white">
        <div className="container-gov flex flex-col items-center gap-6 text-center">
          <NationalEmblem className="h-20 w-20" />
          <h2 className="max-w-2xl font-serif text-3xl font-bold md:text-4xl">
            Injured at work? We are here to help.
          </h2>
          <p className="max-w-xl text-white/75">
            Lodging a claim is free and can be done entirely online. Our officers
            are ready to guide you through every step.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="xl">
              <Link href="/claims#lodge">Lodge a Claim <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline-light" size="xl">
              <Link href="/contact">Speak to an officer</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
