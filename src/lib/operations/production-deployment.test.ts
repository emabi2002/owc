import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const releaseScriptPath = join(process.cwd(), "deploy", "release.sh");
const workflowPath = join(process.cwd(), ".github", "workflows", "deploy.yml");

describe("OWC production application release contract", () => {
  test("release script protects the deployed revision with preflight, health smoke and rollback", () => {
    const script = readFileSync(releaseScriptPath, "utf8");

    expect(script).toContain("set -euo pipefail");
    expect(script).toContain("git status --porcelain");
    expect(script).toContain("PREVIOUS_SHA=");
    expect(script).toContain("/api/health");
    expect(script).toContain("rollback");
    expect(script).toContain("git reset --hard \"$PREVIOUS_SHA\"");
    expect(script).toContain("pm2 reload ecosystem.config.js --update-env");
  });

  test("GitHub deployment delegates remote release behavior to the versioned release script", () => {
    const workflow = readFileSync(workflowPath, "utf8");

    expect(workflow).toContain("bash deploy/release.sh");
    expect(workflow).not.toContain("git pull --ff-only\n            bun install --frozen-lockfile");
  });
});
