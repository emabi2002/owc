import type {
  CanonicalContentRecord,
  CanonicalMigrationDocument,
} from "./contracts";

export function buildMigrationDocument(
  records: CanonicalContentRecord[],
  source: CanonicalMigrationDocument["source"],
  generatedAt = new Date().toISOString(),
): CanonicalMigrationDocument {
  const seen = new Set<string>();
  for (const item of records) {
    if (seen.has(item.key)) {
      throw new Error(`Duplicate Drupal migration key: ${item.key}`);
    }
    seen.add(item.key);
  }

  const ordered = [...records].sort((a, b) => {
    const typeOrder = a.contentType.localeCompare(b.contentType);
    return typeOrder || a.key.localeCompare(b.key);
  });

  return {
    schemaVersion: 1,
    generatedAt,
    source,
    records: ordered,
  };
}
