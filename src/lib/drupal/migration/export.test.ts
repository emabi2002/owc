import { describe, expect, test } from "bun:test";
import type { CanonicalContentRecord } from "./contracts";
import {
  buildMigrationDocument,
  buildRepositoryReferenceRecords,
  recordsFromSupabaseSnapshot,
} from "./export";

const record = (
  contentType: CanonicalContentRecord["contentType"],
  key: string,
): CanonicalContentRecord => ({
  sourceType: `${contentType}s`,
  sourceId: key.split(":").at(-1) ?? key,
  contentType,
  key,
  status: "published",
  attributes: { title: key },
});

describe("buildMigrationDocument", () => {
  test("sorts records deterministically by content type then natural key", () => {
    const document = buildMigrationDocument(
      [
        record("tender", "tender:OWC/RFT/2026/014"),
        record("news", "news:n2"),
        record("form", "form:WC-1"),
        record("news", "news:n1"),
      ],
      "repository-reference",
      "2026-09-13T09:30:00.000Z",
    );

    expect(document.records.map((item) => item.key)).toEqual([
      "form:WC-1",
      "news:n1",
      "news:n2",
      "tender:OWC/RFT/2026/014",
    ]);
    expect(document.schemaVersion).toBe(1);
    expect(document.source).toBe("repository-reference");
    expect(document.generatedAt).toBe("2026-09-13T09:30:00.000Z");
  });

  test("rejects duplicate natural keys before an export can be written", () => {
    expect(() =>
      buildMigrationDocument(
        [record("form", "form:WC-1"), record("form", "form:WC-1")],
        "repository-reference",
        "2026-09-13T09:30:00.000Z",
      ),
    ).toThrow("Duplicate Drupal migration key: form:WC-1");
  });

  test("assembles repository reference content without promoting workflow state", () => {
    const records = buildRepositoryReferenceRecords();
    expect(records.some((item) => item.key === "form:WC-1")).toBe(true);
    expect(records.some((item) => item.key === "news:n1")).toBe(true);
    expect(records.some((item) => item.key === "legislation:Chapter 179")).toBe(true);
    expect(records.every((item) => item.status === "published")).toBe(true);
  });

  test("preserves Supabase editorial state and FAQ sort order", () => {
    const records = recordsFromSupabaseSnapshot({
      pages: [
        {
          id: "about",
          slug: "about-us",
          title: "About OWC",
          body: "Body",
          status: "approved",
        },
      ],
      faqs: [
        {
          id: "faq-1",
          question: "How do I lodge?",
          answer: "Use the claim service.",
          category: "Claims",
          sort_order: 7,
          status: "submitted",
        },
      ],
    });

    const page = records.find((item) => item.key === "page:about");
    const faq = records.find((item) => item.key === "faq:faq-1");
    expect(page?.status).toBe("approved");
    expect(faq?.status).toBe("review");
    expect(faq?.attributes.field_sort_order).toBe(7);
  });
});
