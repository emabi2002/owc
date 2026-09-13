import { describe, expect, test } from "bun:test";
import {
  DEMO_BANK_ACCOUNT,
  DEMO_CLAIM_REFERENCE,
  DEMO_EMPLOYER,
  DEMO_EMPLOYMENT,
  DEMO_IDENTITY,
  DEMO_INSURANCE_POLICY,
  DEMO_MEDICAL_CERTIFICATE,
  DEMO_TAXPAYER,
} from "./data";

const scriptPath = "docs/RFQ_LIVE_DEMO_SCRIPT.md";

async function read(path: string) {
  return Bun.file(path).text();
}

describe("OWC RFQ live demonstration contract", () => {
  test("uses the current integration health endpoint and presentation routes", async () => {
    const script = await read(scriptPath);
    expect(script).toContain("/admin/integrations");
    expect(script).toContain("/admin/integrations/process");
    expect(script).toContain("/api/integrations/health");
    expect(script).not.toContain("/api/sandbox/health");
  });

  test("uses the current coherent synthetic claim identifiers", async () => {
    const script = await read(scriptPath);
    for (const expected of [
      DEMO_IDENTITY.nid,
      DEMO_EMPLOYER.registrationNo,
      DEMO_TAXPAYER.tin,
      DEMO_EMPLOYMENT.employeeNo,
      DEMO_MEDICAL_CERTIFICATE.certificateNo,
      DEMO_INSURANCE_POLICY.policyNo,
      DEMO_BANK_ACCOUNT.accountReference,
      DEMO_CLAIM_REFERENCE,
    ]) {
      expect(script).toContain(expected);
    }
  });

  test("does not promise an obsolete payment reference or a real external transaction", async () => {
    const script = await read(scriptPath);
    expect(script).toContain("TXN-2026-");
    expect(script).not.toContain("TXN-DEMO-");
    expect(script).toContain("synthetic");
    expect(script).toContain("No production connection");
  });

  test("keeps the demo recovery checklist aligned with the disabled-by-default sandbox boundary", async () => {
    const script = await read(scriptPath);
    expect(script).toContain("OWC_ENABLE_SANDBOX=true");
    expect(script).toContain("disabled by default");
    expect(script).toContain("all expected services");
  });
});
