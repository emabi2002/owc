import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const expectedContentTypes = [
  "news",
  "form",
  "report",
  "faq",
  "publication",
  "legislation",
  "tender",
  "page",
];

const expectedStates = ["draft", "review", "approved", "published", "archived"];
const expectedRoles = [
  "cms_administrator",
  "content_editor",
  "reviewer",
  "publisher",
  "auditor",
];

describe("OWC Drupal bootstrap configuration", () => {
  test("declares the required editorial bundles, workflow states and roles", async () => {
    const raw = await readFile("drupal/manifest.json", "utf8");
    const manifest = JSON.parse(raw) as {
      contentTypes: string[];
      moderationStates: string[];
      roles: string[];
    };

    expect(JSON.stringify(manifest.contentTypes)).toBe(JSON.stringify(expectedContentTypes));
    expect(JSON.stringify(manifest.moderationStates)).toBe(JSON.stringify(expectedStates));
    expect(JSON.stringify(manifest.roles)).toBe(JSON.stringify(expectedRoles));
  });

  test("declares isolated Drupal and PostgreSQL services", async () => {
    const compose = await readFile("drupal/docker-compose.yml", "utf8");
    expect(compose.includes("drupal:" )).toBe(true);
    expect(compose.includes("postgres:" )).toBe(true);
    expect(compose.includes("drupal_data:" )).toBe(true);
    expect(compose.includes("postgres_data:" )).toBe(true);
  });
});
