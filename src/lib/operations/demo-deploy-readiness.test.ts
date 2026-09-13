import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/deploy.yml"),
  "utf8",
);

describe("demonstration deployment readiness", () => {
  test("checks required SSH configuration before deployment", () => {
    expect(workflow).toContain("id: deploy-config");
    expect(workflow).toContain("DEPLOY_HOST");
    expect(workflow).toContain("DEPLOY_USER");
    expect(workflow).toContain("DEPLOY_PATH");
    expect(workflow).toContain("DEPLOY_SSH_KEY");
    expect(workflow).toContain("configured=false");
    expect(workflow).toContain("configured=true");
  });

  test("skips SSH safely until the demonstration host is configured", () => {
    expect(workflow).toContain(
      "Demonstration deployment not configured; skipping SSH deploy",
    );
    expect(workflow).toContain(
      "if: steps.deploy-config.outputs.configured == 'true'",
    );
  });

  test("defaults SSH port without exposing environment secrets", () => {
    expect(workflow).toContain("secrets.DEPLOY_PORT || '22'");
    expect(workflow).not.toContain("set -x");
    expect(workflow).not.toContain("printenv");
  });
});
