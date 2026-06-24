import Link from "next/link";
import { Mail, MapPin, Phone, Clock, ArrowUpRight, ShieldCheck } from "lucide-react";
import { OWCSeal } from "@/components/owc-emblem";
import { ORG } from "@/lib/site-data";

const FOOTER_COLS = [
  {
    title: "Services",
    links: [
      { label: "Lodge a Claim", href: "/claims#lodge" },
      { label: "Track a Claim", href: "/claims#track" },
      { label: "Employer Registration", href: "/employers#register" },
      { label: "Report an Injury", href: "/employers#report" },
      { label: "Forms & Downloads", href: "/forms" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Mandate", href: "/about#mandate" },
      { label: "Functions", href: "/about#functions" },
      { label: "Governance", href: "/about#governance" },
      { label: "The Ministry", href: "/about#ministry" },
      { label: "News & Notices", href: "/news" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Reports & Statistics", href: "/reports" },
      { label: "Annual Reports", href: "/reports#downloads" },
      { label: "OHS Information", href: "/reports#ohs" },
      { label: "Claims FAQs", href: "/claims#faqs" },
      { label: "Contact & Enquiry", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-white/75">
      {/* Pre-footer assistance strip */}
      <div className="border-b border-white/10 bg-primary">
        <div className="container-gov flex flex-col items-center justify-between gap-4 py-6 text-center md:flex-row md:text-left">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">
              Need help with a claim or enquiry?
            </h3>
            <p className="text-sm text-white/70">
              Our officers are available {ORG.hours.split("·")[1]?.trim() || "during business hours"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${ORG.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground transition-colors hover:bg-gold-soft"
            >
              <Phone className="h-4 w-4" /> {ORG.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Contact OWC <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-gov grid gap-10 py-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-start gap-4">
            <OWCSeal className="h-20 w-20 shrink-0" withText={false} />
            <div>
              <div className="font-serif text-lg font-bold leading-tight text-white">
                Office of Workers Compensation
              </div>
              <div className="text-xs uppercase tracking-[0.14em] text-gold">
                {ORG.ministry}
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
                Protecting workers and supporting employers across Papua New
                Guinea under the {ORG.act}.
              </p>
            </div>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              {col.title}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/65 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-2">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Head Office
          </h4>
          <ul className="space-y-3 text-sm text-white/65">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{ORG.address}, {ORG.city}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${ORG.phone.replace(/\s/g, "")}`} className="hover:text-gold">{ORG.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${ORG.email}`} className="hover:text-gold">{ORG.email}</a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{ORG.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance note */}
      <div className="border-t border-white/10">
        <div className="container-gov flex flex-col gap-3 py-4 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" />
            Secured &amp; operated in line with PNG Government ICT, DICT &amp;
            NICTA standards. All submissions are encrypted.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/about" className="hover:text-gold">Privacy Policy</Link>
            <Link href="/about" className="hover:text-gold">Terms of Use</Link>
            <Link href="/about" className="hover:text-gold">Accessibility</Link>
            <Link href="/about" className="hover:text-gold">Disclaimer</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/30">
        <div className="container-gov flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Office of Workers Compensation, {ORG.country}. All rights reserved.</p>
          <p>Powered by the {ORG.ministry}</p>
        </div>
      </div>
    </footer>
  );
}
