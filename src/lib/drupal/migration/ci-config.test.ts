import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Drupal content migration CI", () => {
  test("exports, imports twice, and verifies parity in the isolated Drupal job", async () => {
    const workflow = await readFile(".github/workflows/deploy.yml", "utf8");

    expect(workflow.includes("bun run drupal:export-content")).toBe(true);
    expect(workflow.match(/import-content\.sh/g)?.length).toBeGreaterThanOrEqual(2);
    expect(workflow.includes("verify-content-parity.sh")).toBe(true);
  });

  test("does not deploy feature-branch migration work to production", async () => {
    const workflow = await readFile(".github/workflows/deploy.yml", "utf8");
    expect(workflow.includes("github.ref == 'refs/heads/main'")).toBe(true);
  });
});
