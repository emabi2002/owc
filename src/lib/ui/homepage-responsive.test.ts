import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const readSource = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

const homepage = readSource("src/app/(public)/page.tsx");
const header = readSource("src/components/site-header.tsx");
const globals = readSource("src/app/globals.css");

describe("homepage responsive presentation contract", () => {
  test("wide displays give the hero and quick actions a 1600px presentation shell", () => {
    expect(globals).toMatch(
      /#main-content\s*>\s*section\.bg-flag-diag\s*>\s*\.container-gov\s*\{[\s\S]*?max-width:\s*100rem;/,
    );
    expect(globals).toMatch(
      /#main-content\s*>\s*section\.bg-flag-diag\s*\+\s*section\s*>\s*\.container-gov\s*\{[\s\S]*?max-width:\s*100rem;/,
    );
  });

  test("the hero stays stacked through tablet widths and scales its image progressively", () => {
    expect(globals).toContain("@media (min-width: 1024px) and (max-width: 1279px)");
    expect(globals).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(globals).toContain("height: 260px");
    expect(globals).toContain("height: 320px");
    expect(globals).toContain("height: 360px");

    // The existing desktop grid and 420px image remain the >=1280px presentation.
    expect(homepage).toContain("lg:grid-cols-12");
    expect(homepage).toContain("h-[420px]");
  });

  test("tablet header suppresses the desktop search field so only compact search remains", () => {
    expect(globals).toContain("@media (min-width: 768px) and (max-width: 1023px)");
    expect(globals).toContain('header a[aria-label="Search the OWC website"]');
    expect(globals).toContain("display: none");

    // Current markup intentionally keeps both controls available; CSS selects one per breakpoint.
    expect(header).toContain("hover:text-foreground md:flex");
    expect(header).toContain('className="lg:hidden" aria-label="Search"');
  });
});
