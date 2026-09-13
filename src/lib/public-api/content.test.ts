import { describe, expect, test } from "bun:test";

describe("OWC public content API", () => {
  test("serializes public news without exposing CMS-specific fields", async () => {
    let mod: Record<string, unknown> = {};
    try {
      mod = await import("./content");
    } catch {
      // RED phase: implementation intentionally does not exist yet.
    }

    const serialize = mod.serializePublicNews as
      | undefined
      | ((items: Record<string, unknown>[]) => Record<string, unknown>[]);

    const result = serialize?.([
      {
        id: "n1",
        slug: "owc-update",
        category: "Announcement",
        date: "2026-09-12",
        title: "OWC update",
        excerpt: "Public update",
        body: "Details",
        image: "/news.jpg",
        featured: true,
        drupal_internal_nid: 99,
      },
    ]);

    expect(result?.[0]?.slug).toBe("owc-update");
    expect("drupal_internal_nid" in (result?.[0] ?? {})).toBe(false);
  });

  test("serializes form downloads using the OWC public contract", async () => {
    let mod: Record<string, unknown> = {};
    try {
      mod = await import("./content");
    } catch {
      // RED phase.
    }

    const serialize = mod.serializePublicForms as
      | undefined
      | ((items: Record<string, unknown>[]) => Record<string, unknown>[]);

    const result = serialize?.([
      {
        id: "f1",
        code: "WC-1",
        title: "Worker Application",
        category: "Claims",
        format: "PDF",
        size: "248 KB",
        updated: "2026-09-12",
        fileUrl: "/forms/wc-1.pdf",
      },
    ]);

    expect(result?.[0]?.code).toBe("WC-1");
    expect(result?.[0]?.fileUrl).toBe("/forms/wc-1.pdf");
  });
});
