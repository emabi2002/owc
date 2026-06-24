import type { Metadata } from "next";
import {
  TrendingUp,
  FileBarChart,
  Download,
  HardHat,
  ShieldAlert,
  BookOpen,
  Activity,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndustryBars, TrendChart } from "@/components/reports/charts";
import { REPORTS, STAT_HIGHLIGHTS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Reports & Statistics",
  description:
    "Workplace injury data, compensation claims statistics, occupational health and safety information, and downloadable annual reports and policy documents.",
};

const OHS = [
  { icon: HardHat, t: "Workplace safety standards", d: "Guidance on maintaining safe systems of work across industries." },
  { icon: ShieldAlert, t: "Hazard identification", d: "Resources to help identify and control workplace hazards." },
  { icon: Activity, t: "Injury prevention", d: "Practical strategies to reduce the rate of workplace injuries." },
  { icon: BookOpen, t: "OHS national strategy", d: "The strategic framework for safer PNG workplaces 2024–2028." },
];

export default function ReportsPage() {
  return (
    <>
      <PageHero
        eyebrow="Reports & Data"
        title="Workplace data, statistics and publications"
        subtitle="Transparent reporting on workplace injuries, compensation claims and occupational health and safety across Papua New Guinea."
        breadcrumb={[{ label: "Reports & Data" }]}
      />

      {/* Highlights */}
      <section id="statistics" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="2025 snapshot"
            title="Key performance indicators"
            description="A high-level view of OWC activity for the most recent reporting period."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_HIGHLIGHTS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  <Badge variant="success" className="text-[10px]">{s.trend}</Badge>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="border-y border-border bg-secondary/60 py-16 lg:py-20">
        <div className="container-gov grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-gold" />
              <h3 className="font-serif text-lg font-bold text-primary">
                Claims lodged vs. paid (2020–2025)
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Annual trend in claims received and compensation paid.
            </p>
            <div className="mt-6">
              <TrendChart />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              <h3 className="font-serif text-lg font-bold text-primary">
                Claims by industry (2025)
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Distribution of workplace injury claims across key sectors.
            </p>
            <div className="mt-6">
              <IndustryBars />
            </div>
          </div>
        </div>
      </section>

      {/* OHS */}
      <section id="ohs" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Occupational Health & Safety"
            title="Building safer workplaces"
            description="The OWC promotes occupational health and safety as the most effective way to protect workers and reduce compensation claims."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {OHS.map((o) => (
              <div key={o.t} className="rounded-2xl border border-border bg-card p-6">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary">
                  <o.icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-base font-bold text-primary">{o.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section id="downloads" className="scroll-mt-28 border-t border-border bg-secondary/60 py-16 lg:py-24">
        <div className="container-gov">
          <SectionHeading
            eyebrow="Publications"
            title="Annual reports & policy documents"
            description="Download the latest OWC reports, statistical bulletins and policy publications."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {REPORTS.map((r) => (
              <div
                key={r.title}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white">
                    <FileBarChart className="h-6 w-6" />
                  </span>
                  <Badge variant="navy">{r.year}</Badge>
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold leading-snug text-primary">
                  {r.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    PDF · {r.size}
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-8 text-center md:flex-row md:text-left">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">
                Looking for older publications?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Request archived reports and historical statistics from our office.
              </p>
            </div>
            <Button asChild variant="default">
              <a href="/contact">Request archives <ArrowUpRight /></a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
