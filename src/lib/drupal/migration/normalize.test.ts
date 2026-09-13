import { describe, expect, test } from "bun:test";
import {
  mapSourceStatus,
  normalizeFaq,
  normalizeForm,
  normalizeLegislation,
  normalizeNews,
  normalizePage,
  normalizePublication,
  normalizeReport,
  normalizeTender,
} from "./normalize";

describe("Drupal migration normalization", () => {
  test("maps submitted to Drupal review without promoting publication state", () => {
    expect(mapSourceStatus("submitted")).toBe("review");
    expect(mapSourceStatus("approved")).toBe("approved");
    expect(mapSourceStatus("published")).toBe("published");
  });

  test("uses stable bundle-specific natural keys", () => {
    expect(normalizeForm({ id: "f1", code: "WC-1", title: "Worker claim", category: "Claims", format: "PDF", size: "1 KB", updated: "2026-01-01" }).key).toBe("form:WC-1");
    expect(normalizeLegislation({ id: "l1", title: "Act", reference: "Chapter 179", category: "Act", description: "x", enactedYear: "1978" }).key).toBe("legislation:Chapter 179");
    expect(normalizeTender({ id: "t1", reference: "OWC/RFT/2026/014", title: "Tender", category: "Goods", description: "x", status: "open", publishedDate: "2026-06-10", closingDate: "2026-07-15" }).key).toBe("tender:OWC/RFT/2026/014");
  });

  test("maps existing public content shapes to Drupal fields", () => {
    const news = normalizeNews({ id: "n1", slug: "owc-launch", category: "Announcement", date: "2026-06-18", title: "Launch", excerpt: "Excerpt", body: "Body", image: "/hero.png", featured: true });
    expect(news.contentType).toBe("news");
    expect(news.attributes.field_category).toBe("Announcement");
    expect(news.attributes.field_excerpt).toBe("Excerpt");
    expect(news.attributes.field_featured).toBe(true);

    const faq = normalizeFaq({ id: "q1", q: "Question?", a: "Answer", category: "Claims" });
    expect(faq.attributes.field_question).toBe("Question?");
    expect(faq.attributes.field_answer).toBe("Answer");

    const report = normalizeReport({ id: "r1", title: "Annual Report", year: "2025", size: "4 MB", desc: "Description" });
    expect(report.attributes.field_year).toBe("2025");

    const publication = normalizePublication({ id: "p1", title: "Guide", category: "Guide", description: "Description", year: "2026", format: "PDF", size: "1 MB" });
    expect(publication.attributes.field_file_format).toBe("PDF");
  });

  test("normalizes pages with explicit workflow state", () => {
    const page = normalizePage({ id: "about", slug: "about-us", title: "About OWC", body: "Body", category: "Corporate", navigationWeight: 2, status: "approved" });
    expect(page.key).toBe("page:about");
    expect(page.status).toBe("approved");
    expect(page.attributes.field_navigation_weight).toBe(2);
  });
});
