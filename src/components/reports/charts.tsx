import { CLAIMS_BY_INDUSTRY, CLAIMS_TREND } from "@/lib/site-data";

export function IndustryBars() {
  const max = Math.max(...CLAIMS_BY_INDUSTRY.map((d) => d.value));
  return (
    <div className="space-y-4">
      {CLAIMS_BY_INDUSTRY.map((d, i) => (
        <div key={d.industry}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{d.industry}</span>
            <span className="font-mono font-semibold text-primary">
              {d.value.toLocaleString()}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full origin-left rounded-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background:
                  i % 2 === 0
                    ? "hsl(var(--primary))"
                    : "hsl(var(--gold))",
                animation: `barGrow 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both`,
              }}
            />
          </div>
        </div>
      ))}
      <style>{`@keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}

export function TrendChart() {
  const data = CLAIMS_TREND;
  const W = 640;
  const H = 300;
  const pad = { top: 24, right: 20, bottom: 38, left: 52 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.ceil(Math.max(...data.map((d) => d.lodged)) / 2000) * 2000;

  const x = (i: number) => pad.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = (key: "lodged" | "paid") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key])}`).join(" ");

  const area =
    `M${x(0)},${y(data[0].lodged)} ` +
    data.map((d, i) => `L${x(i)},${y(d.lodged)}`).join(" ") +
    ` L${x(data.length - 1)},${pad.top + innerH} L${x(0)},${pad.top + innerH} Z`;

  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];

  return (
    <div>
      <div className="mb-4 flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Claims lodged
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          Claims paid
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Claims lodged versus paid, 2020 to 2025">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid + y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y(t)}
              y2={y(t)}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray={i === 0 ? "0" : "3 4"}
            />
            <text
              x={pad.left - 10}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize="11"
            >
              {(t / 1000).toLocaleString()}k
            </text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) => (
          <text
            key={d.year}
            x={x(i)}
            y={H - 12}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            {d.year}
          </text>
        ))}

        <path d={area} fill="url(#areaFill)" />
        <path d={line("lodged")} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line("paid")} fill="none" stroke="hsl(var(--gold))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 0" />

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.lodged)} r="3.5" fill="hsl(var(--primary))" stroke="white" strokeWidth="1.5" />
            <circle cx={x(i)} cy={y(d.paid)} r="3.5" fill="hsl(var(--gold))" stroke="white" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}
