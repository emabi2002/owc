import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("OWC Drupal dependency download resilience", () => {
  test("retries transient Composer dependency download failures with a bounded budget", async () => {
    const dockerfile = await readFile("drupal/Dockerfile", "utf8");

    expect(dockerfile).toContain('attempt=1');
    expect(dockerfile).toContain('[ "$attempt" -ge 3 ]');
    expect(dockerfile).toContain('attempt=$((attempt + 1))');
    expect(dockerfile).toContain('sleep 5');
    expect(dockerfile).toContain("composer require drush/drush:^13 'drupal/openid_connect:^3.0@alpha'");
  });

  test("fails the image build after the retry budget instead of suppressing dependency errors", async () => {
    const dockerfile = await readFile("drupal/Dockerfile", "utf8");

    expect(dockerfile).toContain('exit 1');
    expect(dockerfile).not.toContain('|| true');
  });
});
