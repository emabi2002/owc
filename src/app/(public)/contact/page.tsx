import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, AlertCircle, Building2 } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { ORG } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact & Enquiry",
  description:
    "Contact the Office of Workers Compensation. Office address, phone, email, enquiry form with category selection, and map location in Waigani, Port Moresby.",
};

export default function ContactPage() {
  const details = [
    {
      icon: MapPin,
      t: "Visit us",
      lines: [ORG.address, ORG.city, ORG.postal],
    },
    {
      icon: Phone,
      t: "Call us",
      lines: [`General: ${ORG.phone}`, `Claims hotline: ${ORG.emergency}`],
    },
    {
      icon: Mail,
      t: "Email us",
      lines: [`General: ${ORG.email}`, `Claims: ${ORG.claimsEmail}`],
    },
    {
      icon: Clock,
      t: "Office hours",
      lines: ["Monday – Friday", "8:00 AM – 4:06 PM", "Closed public holidays"],
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact & Enquiry"
        title="Get in touch with our team"
        subtitle="Whether you have a question about a claim, employer registration or a general enquiry, we are here to help."
        breadcrumb={[{ label: "Contact" }]}
      />

      {/* Detail cards */}
      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {details.map((d) => (
              <div key={d.t} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white">
                  <d.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-primary">{d.t}</h3>
                <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                  {d.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form + side info */}
          <div className="mt-14 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
            <aside className="lg:col-span-5">
              <div className="space-y-6">
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                    <h3 className="font-serif text-lg font-bold text-primary">
                      Reporting a serious incident?
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For a workplace fatality or serious injury, contact our claims
                    hotline immediately so we can respond quickly.
                  </p>
                  <a
                    href={`tel:${ORG.emergency.replace(/\s/g, "")}`}
                    className="mt-3 inline-block font-serif text-xl font-bold text-destructive"
                  >
                    {ORG.emergency}
                  </a>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-5 py-3">
                    <Building2 className="h-4 w-4 text-gold" />
                    <span className="font-serif text-sm font-bold text-primary">
                      OWC Head Office — Waigani
                    </span>
                  </div>
                  <iframe
                    title="OWC Head Office location map"
                    src="https://www.google.com/maps?q=Waigani,+Port+Moresby,+Papua+New+Guinea&output=embed"
                    className="h-[300px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
