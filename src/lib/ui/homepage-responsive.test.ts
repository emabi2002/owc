import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const readSource = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

const homepage = readSource("src/app/(public)/page.tsx");
const header = readSource("src/components/site-header.tsx");
const globals = readSource("src/app/globals.css");

describe("homepage responsive presentation contract", () => {
  test("wide displays use a dedicated hero shell without forcing article content wider", () => {
    expect(globals).toContain(".container-hero");
    expect(globals).toMatch(/\.container-hero\s*\{[\s\S]*?max-width:\s*100rem;/);
    expect(homepage).toContain("container-hero relative grid");
  });

  test("the hero stays stacked through tablet widths and scales its image progressively", () => {
    expect(homepage).toContain("xl:grid-cols-12");
    expect(homepage).not.toContain("lg:grid-cols-12");
    expect(homepage).toContain("xl:col-span-7");
    expect(homepage).toContain("xl:col-span-5");
    expect(homepage).toContain(
      "h-[260px] sm:h-[320px] md:h-[360px] xl:h-[420px]",
    );
    expect(homepage).toContain("opacity-[0.05] xl:block");
  });

  test("tablet header exposes only the compact search control", () => {
    expect(header).toContain("hover:text-foreground lg:flex");
    expect(header).not.toContain("hover:text-foreground md:flex");
  });
});
