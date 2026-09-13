import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

async function lower(path: string) {
  return (await readFile(path, "utf8")).toLowerCase();
}

describe("OWC reference readiness status reconciliation", () => {
  test("records the completed reference adapters for tasks 7 through 10", async () => {
    const status = await lower("docs/OWC_TASK_STATUS.md");

    for (const term of [
      "reference evidence repository",
      "reference malware scanner",
      "reference notification gateway",
      "reference government integration facade",
    ]) {
      expect(status).toContain(term);
    }
  });

  test("does not promote tasks 7 through 10 to live or production complete", async () => {
    const status = await readFile("docs/OWC_TASK_STATUS.md", "utf8");

    for (const task of [7, 8, 9, 10]) {
      const row = status.split("\n").find((line) => line.startsWith(`| ${task} |`));
      expect(row).toBeDefined();
      expect(row).toContain("**PARTIAL / EXTERNAL ACTIVATION**");
    }
  });

  test("handover describes the reference evidence, scanner, notification and agency facades as non-production", async () => {
    const handover = await lower("docs/HANDOVER.md");

    for (const term of [
      "reference evidence repository",
      "reference malware scanner",
      "reference notification gateway",
      "reference government integration facade",
    ]) {
      expect(handover).toContain(term);
    }
    expect(handover).toContain("disabled by default");
    expect(handover).toContain("production activation remains external");
  });

  test("retains the authoritative live-service and formal acceptance boundary", async () => {
    const status = await lower("docs/OWC_TASK_STATUS.md");
    const handover = await lower("docs/HANDOVER.md");

    expect(status).toContain("real agency endpoints");
    expect(status).toContain("formal acceptance");
    expect(handover).toContain("real endpoints");
    expect(handover).toContain("uat");
    expect(handover).toContain("production");
  });
});
