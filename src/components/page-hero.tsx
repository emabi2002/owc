import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BirdOfParadise } from "@/components/owc-emblem";

export function PageHero({
  title,
  subtitle,
  eyebrow,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  breadcrumb: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-flag-diag text-white">
      <div className="absolute inset-0 bg-grid-faint opacity-30" aria-hidden />
      <BirdOfParadise
        className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 opacity-[0.06]"
        plumeColor="white"
        birdColor="white"
      />
      <div className="container-gov relative py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
            <li>
              <Link href="/" className="flex items-center gap-1 hover:text-gold">
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
            </li>
            {breadcrumb.map((b, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                {b.href ? (
                  <Link href={b.href} className="hover:text-gold">
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gold">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
        <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight md:text-[2.6rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className={`eyebrow mb-3 ${align === "center" ? "justify-center" : ""}`}>
          <span className="rule-gold" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-serif text-2xl font-bold leading-tight md:text-[2rem] ${
          light ? "text-white" : "text-primary"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 text-base leading-relaxed ${
            light ? "text-white/75" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
