import { describe, expect, test } from "bun:test";
import type { CanonicalContentRecord } from "./contracts";
import { buildMigrationDocument } from "./export";

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
});
