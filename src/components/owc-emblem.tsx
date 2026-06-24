import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Bird of Paradise plume mark (procedurally generated for clean symmetry)   */
/* -------------------------------------------------------------------------- */

function buildPlumes() {
  const base = { x: 100, y: 116 };
  const count = 13;
  const startAngle = -162;
  const endAngle = -18;
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = ((startAngle + (endAngle - startAngle) * t) * Math.PI) / 180;
    const len = 78 - Math.abs(t - 0.5) * 34;
    const tipX = base.x + Math.cos(angle) * len;
    const tipY = base.y + Math.sin(angle) * len;
    const w = 3.4;
    const perp = angle + Math.PI / 2;
    const midLen = len * 0.5;
    const c1x = base.x + Math.cos(angle) * midLen + Math.cos(perp) * w;
    const c1y = base.y + Math.sin(angle) * midLen + Math.sin(perp) * w;
    const c2x = base.x + Math.cos(angle) * midLen - Math.cos(perp) * w;
    const c2y = base.y + Math.sin(angle) * midLen - Math.sin(perp) * w;
    paths.push(
      `M${base.x},${base.y} Q${c1x.toFixed(1)},${c1y.toFixed(1)} ${tipX.toFixed(
        1
      )},${tipY.toFixed(1)} Q${c2x.toFixed(1)},${c2y.toFixed(1)} ${base.x},${
        base.y
      } Z`
    );
  }
  return paths;
}

const PLUMES = buildPlumes();

export function BirdOfParadise({
  className,
  plumeColor = "hsl(var(--gold))",
  birdColor = "hsl(var(--gold-soft))",
}: {
  className?: string;
  plumeColor?: string;
  birdColor?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* Plume fan */}
      <g opacity="0.96">
        {PLUMES.map((d, i) => (
          <path key={i} d={d} fill={plumeColor} opacity={0.55 + (i % 2) * 0.35} />
        ))}
      </g>
      {/* Bird body */}
      <g fill={birdColor}>
        {/* spread wings */}
        <path d="M100 120 C 78 104, 52 108, 36 122 C 58 122, 76 126, 100 128 Z" />
        <path d="M100 120 C 122 104, 148 108, 164 122 C 142 122, 124 126, 100 128 Z" />
        {/* torso */}
        <path d="M100 104 C 108 104, 112 116, 109 132 C 107 142, 93 142, 91 132 C 88 116, 92 104, 100 104 Z" />
        {/* head */}
        <circle cx="100" cy="100" r="8.5" />
        {/* beak */}
        <path d="M100 92 L 104 83 L 96 83 Z" />
        {/* tail feathers */}
        <path d="M96 140 L 90 162 L 97 150 Z" />
        <path d="M104 140 L 110 162 L 103 150 Z" />
      </g>
      {/* Kundu drum / ceremonial perch */}
      <g fill={plumeColor}>
        <rect x="48" y="150" width="104" height="11" rx="5.5" />
        <g fill="hsl(var(--navy-deep))" opacity="0.55">
          <path d="M70 150 l6 11 6-11 z" />
          <path d="M94 150 l6 11 6-11 z" />
          <path d="M118 150 l6 11 6-11 z" />
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Full circular government seal                                              */
/* -------------------------------------------------------------------------- */

export function OWCSeal({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label="Office of Workers Compensation Papua New Guinea seal">
      <defs>
        <path
          id="seal-top"
          d="M 120 120 m -92 0 a 92 92 0 1 1 184 0"
          fill="none"
        />
        <path
          id="seal-bottom"
          d="M 120 120 m -78 0 a 78 78 0 1 0 156 0"
          fill="none"
        />
        <radialGradient id="seal-bg" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="hsl(212 72% 24%)" />
          <stop offset="100%" stopColor="hsl(var(--navy-deep))" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="120" r="118" fill="url(#seal-bg)" />
      <circle cx="120" cy="120" r="112" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5" opacity="0.6" />
      <circle cx="120" cy="120" r="92" fill="none" stroke="hsl(var(--gold))" strokeWidth="2.5" />
      <circle cx="120" cy="120" r="78" fill="none" stroke="hsl(var(--gold))" strokeWidth="1" opacity="0.5" />

      {/* Bird in the centre */}
      <g transform="translate(40 26) scale(0.66)">
        <BirdOfParadise />
      </g>

      {withText && (
        <g
          fill="hsl(var(--gold))"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontWeight: 700,
            letterSpacing: "2.4px",
          }}
        >
          <text fontSize="14" textAnchor="middle">
            <textPath href="#seal-top" startOffset="50%">
              OFFICE OF WORKERS COMPENSATION
            </textPath>
          </text>
          <text fontSize="11" textAnchor="middle">
            <textPath href="#seal-bottom" startOffset="50%">
              PAPUA NEW GUINEA
            </textPath>
          </text>
        </g>
      )}

      {/* Star separators */}
      <g fill="hsl(var(--gold))">
        <circle cx="28" cy="120" r="2.4" />
        <circle cx="212" cy="120" r="2.4" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Compact header lockup                                                      */
/* -------------------------------------------------------------------------- */

export function OWCLockup({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const titleColor = variant === "light" ? "text-white" : "text-primary";
  const subColor = variant === "light" ? "text-white/70" : "text-muted-foreground";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-flag-diag ring-1",
          variant === "light" ? "ring-white/25" : "ring-gold/40"
        )}
      >
        <BirdOfParadise className="h-9 w-9 translate-y-[1px]" />
      </div>
      <div className="leading-tight">
        <div className={cn("font-serif text-[15px] font-bold tracking-tight sm:text-base", titleColor)}>
          Office of Workers Compensation
        </div>
        <div className={cn("text-[10.5px] font-medium uppercase tracking-[0.14em] sm:text-[11px]", subColor)}>
          Ministry of Labour &amp; Employment · PNG
        </div>
      </div>
    </div>
  );
}
