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
});
