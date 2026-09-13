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
    expect(compose.includes("drupal:")).toBe(true);
    expect(compose.includes("postgres:")).toBe(true);
    expect(compose.includes("drupal_sites:")).toBe(true);
    expect(compose.includes("postgres_data:")).toBe(true);
    expect(compose.includes("/opt/drupal/web/sites/default")).toBe(true);
    expect(compose.includes("./config/sync:/opt/drupal/config/sync:ro")).toBe(true);
  });

  test("packages the manifest into the Drupal image", async () => {
    const dockerfile = await readFile("drupal/Dockerfile", "utf8");
    expect(dockerfile.includes("COPY manifest.json /opt/owc-drupal/manifest.json")).toBe(true);
  });

  test("preserves the recovery provisioner with editable widgets and revision workflow", async () => {
    const provision = await readFile("drupal/scripts/provision.php", "utf8");
    expect(provision.includes("EntityFormDisplay")).toBe(true);
    expect(provision.includes("setComponent($fieldName")).toBe(true);
    expect(provision.includes("create_new_draft")).toBe(true);
    expect(provision.includes("'from' => ['published']")).toBe(true);
  });

  test("installs fresh environments from the committed Drupal configuration", async () => {
    const bootstrap = await readFile("drupal/scripts/bootstrap.sh", "utf8");

    expect(bootstrap.includes("CONFIG_SYNC=\"/opt/drupal/config/sync\"")).toBe(true);
    expect(bootstrap.includes("core.extension.yml")).toBe(true);
    expect(bootstrap.includes("site:install")).toBe(true);
    expect(bootstrap.includes("--existing-config")).toBe(true);
    expect(bootstrap.includes("config:status")).toBe(true);
  });

  test("does not rebuild authoritative CMS configuration through provision.php during normal bootstrap", async () => {
    const bootstrap = await readFile("drupal/scripts/bootstrap.sh", "utf8");

    expect(bootstrap.includes("php:script /opt/owc-drupal/scripts/provision.php")).toBe(false);
  });

  test("writes config_sync_directory without shell-expanding Drupal's settings variable", async () => {
    const bootstrap = await readFile("drupal/scripts/bootstrap.sh", "utf8");
    const usesProtectedPhp = bootstrap.includes("php -r") || bootstrap.includes("php <<'PHP'");

    expect(usesProtectedPhp).toBe(true);
    expect(bootstrap.includes("config_sync_directory")).toBe(true);
    expect(bootstrap.includes("$settings")).toBe(true);
    expect(bootstrap.includes('grep -q "^\\\\$settings')).toBe(false);
  });

  test("passes valid PHP namespace references to Drush verification", async () => {
    const verify = await readFile("drupal/scripts/verify.sh", "utf8");

    expect(verify.includes("\\Drupal\\node\\Entity\\NodeType::load")).toBe(true);
    expect(verify.includes("\\Drupal\\user\\Entity\\Role::load")).toBe(true);
    expect(verify.includes("\\Drupal\\workflows\\Entity\\Workflow::load")).toBe(true);
    expect(verify.includes("\\\\Drupal\\\\")).toBe(false);
  });
});
