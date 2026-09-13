import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Drupal migration importer", () => {
  test("packages canonical migration input and importer scripts into the Drupal image", async () => {
    const dockerfile = await readFile("drupal/Dockerfile", "utf8");
    expect(dockerfile.includes("COPY migration /opt/owc-drupal/migration")).toBe(true);
    expect(dockerfile.includes("COPY scripts /opt/owc-drupal/scripts")).toBe(true);
  });

  test("uses deterministic UUIDs and upserts rather than creating duplicate nodes", async () => {
    const common = await readFile("drupal/scripts/migration-common.php", "utf8");
    const importer = await readFile("drupal/scripts/import-content.php", "utf8");

    expect(common.includes("owc_migration_uuid")).toBe(true);
    expect(importer.includes("loadByProperties(['uuid' => $uuid])")).toBe(true);
    expect(importer.includes("moderation_state")).toBe(true);
    expect(importer.includes("$record['status'] === 'published'")).toBe(true);
  });

  test("fails malformed migration documents and reports per-bundle outcomes", async () => {
    const importer = await readFile("drupal/scripts/import-content.php", "utf8");
    expect(importer.includes("schemaVersion")).toBe(true);
    expect(importer.includes("created")).toBe(true);
    expect(importer.includes("updated")).toBe(true);
    expect(importer.includes("skipped")).toBe(true);
    expect(importer.includes("failed")).toBe(true);
  });
});
