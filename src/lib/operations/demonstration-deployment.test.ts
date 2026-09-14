import { describe, expect, test } from "bun:test";

const preflightPath = "deploy/demo-preflight.sh";
const guidePath = "docs/operations/demonstration-deployment.md";

async function read(path: string) {
  return Bun.file(path).text();
}

describe("OWC demonstration deployment package", () => {
  test("provides a fail-closed preflight for every required reference service", async () => {
    expect(await Bun.file(preflightPath).exists()).toBe(true);
    const script = await read(preflightPath);

    for (const setting of [
      "OWC_IDENTITY_MODE",
      "OWC_DEMO_SESSION_SECRET",
      "OWC_DEMO_PASSWORD",
      "OWC_DEMO_MFA_CODE",
      "OWC_ENABLE_DEMO_RESET",
      "OWC_ENABLE_REFERENCE_ECOSYSTEM",
      "OWC_ENABLE_SANDBOX",
      "OWC_ENABLE_REFERENCE_MALWARE_SCANNER",
      "OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY",
      "OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY",
    ]) {
      expect(script).toContain(setting);
    }
    expect(script).toContain("set -euo pipefail");
    expect(script).not.toContain("set -x");
    expect(script).not.toContain("printenv");
  });

  test("forbids any live payment connector from the demonstration profile", async () => {
    const script = await read(preflightPath);
    expect(script).toContain("OWC_PAYMENT_API_BASE_URL");
    expect(script).toContain("OWC_PAYMENT_API_KEY");
    expect(script).toContain("must remain unset");
  });

  test("validates credential shape without printing secret values", async () => {
    const script = await read(preflightPath);
    expect(script).toContain("32");
    expect(script).toContain("six-digit");
    expect(script).not.toContain('echo "$OWC_DEMO_SESSION_SECRET"');
    expect(script).not.toContain('echo "$OWC_DEMO_PASSWORD"');
    expect(script).not.toContain('echo "$OWC_DEMO_MFA_CODE"');
  });

  test("documents the actual-host boundary instead of claiming deployment", async () => {
    expect(await Bun.file(guidePath).exists()).toBe(true);
    const guide = await read(guidePath);
    expect(guide).toContain("DEMO HOST EXTERNAL");
    expect(guide).toContain("DEPLOY_HOST");
    expect(guide).toContain("DEPLOY_USER");
    expect(guide).toContain("DEPLOY_PATH");
    expect(guide).toContain("DEPLOY_SSH_KEY");
    expect(guide).toContain("simulation-only");
    expect(guide).toContain("moneyMovement: false");
  });

  test("exposes a package command for operator preflight", async () => {
    const pkg = JSON.parse(await read("package.json")) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.["demo:preflight"]).toBe("bash deploy/demo-preflight.sh");
  });
});
