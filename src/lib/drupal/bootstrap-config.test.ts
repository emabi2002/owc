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

  test("declares isolated Drupal and PostgreSQL services with persistent state", async () => {
    const compose = await readFile("drupal/docker-compose.yml", "utf8");
    expect(compose.includes("drupal:" )).toBe(true);
    expect(compose.includes("postgres:" )).toBe(true);
    expect(compose.includes("drupal_sites:" )).toBe(true);
    expect(compose.includes("postgres_data:" )).toBe(true);
    expect(compose.includes("/opt/drupal/web/sites/default")).toBe(true);
  });

  test("packages the manifest into the Drupal image", async () => {
    const dockerfile = await readFile("drupal/Dockerfile", "utf8");
    expect(dockerfile.includes("COPY manifest.json /opt/owc-drupal/manifest.json")).toBe(true);
  });

  test("provisions editable field widgets and a published-to-draft transition", async () => {
    const provision = await readFile("drupal/scripts/provision.php", "utf8");
    expect(provision.includes("EntityFormDisplay")).toBe(true);
    expect(provision.includes("setComponent($fieldName")).toBe(true);
    expect(provision.includes("create_new_draft")).toBe(true);
    expect(provision.includes("'from' => ['published']")).toBe(true);
  });
});
