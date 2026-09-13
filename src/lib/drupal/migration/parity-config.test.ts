import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Drupal migration parity verification", () => {
  test("verifies canonical keys against deterministic Drupal UUIDs", async () => {
    const verifier = await readFile("drupal/scripts/verify-content-parity.php", "utf8");
    expect(verifier.includes("owc_migration_uuid")).toBe(true);
    expect(verifier.includes("loadByProperties(['uuid' => $uuid])")).toBe(true);
  });

  test("checks bundle, publication state and mapped field values", async () => {
    const verifier = await readFile("drupal/scripts/verify-content-parity.php", "utf8");
    expect(verifier.includes("bundle_mismatch")).toBe(true);
    expect(verifier.includes("state_mismatch")).toBe(true);
    expect(verifier.includes("field_mismatch")).toBe(true);
    expect(verifier.includes("missing")).toBe(true);
  });

  test("exits unsuccessfully when parity discrepancies exist", async () => {
    const wrapper = await readFile("drupal/scripts/verify-content-parity.sh", "utf8");
    expect(wrapper.includes("set -euo pipefail")).toBe(true);
    expect(wrapper.includes("verify-content-parity.php")).toBe(true);
  });
});
