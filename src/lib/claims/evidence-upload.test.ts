import { describe, expect, test } from "bun:test";
import {
  buildEvidenceStoragePath,
  validateEvidenceFile,
} from "./evidence-upload";

describe("claim evidence upload controls", () => {
  test("accepts approved document and image types within the size limit", () => {
    expect(validateEvidenceFile("medical.pdf", "application/pdf", 2_000_000).ok).toBe(true);
    expect(validateEvidenceFile("incident.jpg", "image/jpeg", 1_000_000).ok).toBe(true);
  });

  test("rejects executable or oversized evidence", () => {
    expect(validateEvidenceFile("payload.exe", "application/x-msdownload", 20_000).ok).toBe(false);
    expect(validateEvidenceFile("huge.pdf", "application/pdf", 21 * 1024 * 1024).ok).toBe(false);
  });

  test("creates a claim-scoped storage path without unsafe filename characters", () => {
    const path = buildEvidenceStoragePath("OWC-2026-004821", "Medical Report (Final).PDF", "abc123");
    expect(path).toBe("claims/OWC-2026-004821/abc123/medical-report-final.pdf");
  });

  test("issues and verifies a short-lived claim-scoped evidence upload token", async () => {
    const evidenceModule = (await import("./evidence-upload")) as Record<string, unknown>;
    const issueEvidenceUploadToken = evidenceModule.issueEvidenceUploadToken as
      | undefined
      | ((claimReference: string, secret: string, options?: { nowMs?: number; ttlMs?: number }) => Promise<string>);
    const verifyEvidenceUploadToken = evidenceModule.verifyEvidenceUploadToken as
      | undefined
      | ((token: string, claimReference: string, secret: string, options?: { nowMs?: number }) => Promise<boolean>);

    expect(typeof issueEvidenceUploadToken).toBe("function");
    expect(typeof verifyEvidenceUploadToken).toBe("function");
    if (!issueEvidenceUploadToken || !verifyEvidenceUploadToken) return;

    const nowMs = Date.parse("2026-09-13T00:00:00Z");
    const secret = "uat-evidence-signing-secret-with-sufficient-entropy";
    const token = await issueEvidenceUploadToken("OWC-2026-004821", secret, {
      nowMs,
      ttlMs: 15 * 60_000,
    });

    expect(
      await verifyEvidenceUploadToken(token, "OWC-2026-004821", secret, {
        nowMs: nowMs + 14 * 60_000,
      }),
    ).toBe(true);
    expect(
      await verifyEvidenceUploadToken(token, "OWC-2026-999999", secret, {
        nowMs: nowMs + 14 * 60_000,
      }),
    ).toBe(false);
    expect(
      await verifyEvidenceUploadToken(token, "OWC-2026-004821", secret, {
        nowMs: nowMs + 16 * 60_000,
      }),
    ).toBe(false);
  });
});
