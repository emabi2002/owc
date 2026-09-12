import { describe, expect, test } from "bun:test";
import {
  buildDrupalJsonApiUrl,
  extractDrupalText,
  mapDrupalNewsNode,
} from "./client";

describe("Drupal JSON:API adapter", () => {
  test("builds a published content collection URL", () => {
    const url = buildDrupalJsonApiUrl(
      "https://cms.owc.gov.pg/",
      "news",
      { sort: "-created", pageLimit: 25 },
    );
    expect(url).toBe(
      "https://cms.owc.gov.pg/jsonapi/node/news?filter%5Bstatus%5D=1&sort=-created&page%5Blimit%5D=25",
    );
  });

  test("extracts Drupal text field values safely", () => {
    expect(extractDrupalText({ value: "<p>Hello</p>", processed: "<p>Hello</p>" })).toBe("<p>Hello</p>");
    expect(extractDrupalText("Plain text")).toBe("Plain text");
    expect(extractDrupalText(null)).toBe("");
  });

  test("maps a Drupal news node into the OWC public news shape", () => {
    const mapped = mapDrupalNewsNode({
      id: "node-1",
      attributes: {
        title: "OWC service update",
        created: "2026-09-12T00:00:00+00:00",
        changed: "2026-09-12T01:00:00+00:00",
        path: { alias: "/news/owc-service-update" },
        field_category: "Announcement",
        field_excerpt: "Service update",
        body: { value: "<p>Details</p>", processed: "<p>Details</p>" },
        field_featured: true,
      },
    });

    expect(mapped.slug).toBe("owc-service-update");
    expect(mapped.title).toBe("OWC service update");
    expect(mapped.category).toBe("Announcement");
    expect(mapped.featured).toBe(true);
  });
});
