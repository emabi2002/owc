import { beforeEach, describe, expect, test } from "bun:test";
import {
  getReferenceEvidence,
  getReferenceEvidenceHealth,
  listReferenceEvidence,
  resetReferenceEvidenceRepository,
  reviewReferenceEvidence,
  storeReferenceEvidence,
} from "@/lib/claims/reference-evidence-repository";

const CLAIM_A = "OWC-REF-2026-0001";
const CLAIM_B = "OWC-REF-2026-0002";

beforeEach(async () => {
  await resetReferenceEvidenceRepository();
});

describe("OWC reference evidence repository behavior", () => {
  test("reports an explicitly synthetic non-durable repository", () => {
    expect(getReferenceEvidenceHealth()).toEqual({
      source: "reference",
      synthetic: true,
      productionConnected: false,
      durable: false,
    });
  });

  test("seeds deterministic synthetic evidence without real claimant data", async () => {
    const items = await listReferenceEvidence(CLAIM_A);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.claimReference === CLAIM_A)).toBe(true);
    expect(items.every((item) => item.sha256?.length === 64)).toBe(true);
  });

  test("stores bytes with safe claim-scoped path and matching SHA-256", async () => {
    const bytes = new TextEncoder().encode(
      "OWC REFERENCE DEMONSTRATION DOCUMENT — SYNTHETIC ONLY",
    );
    const stored = await storeReferenceEvidence({
      claimReference: CLAIM_B,
      category: "Incident",
      title: "Synthetic incident note",
      fileName: "../../Incident Report.PDF",
      mimeType: "application/pdf",
      bytes: bytes.buffer,
      uploadedBy: "Reference claimant",
      securityScan: "clean",
      legalHold: false,
    });

    expect(stored.metadata.claimReference).toBe(CLAIM_B);
    expect(stored.metadata.status).toBe("Pending Review");
    expect(stored.metadata.storagePath).toMatch(
      /^claims\/OWC-REF-2026-0002\/ref-evidence-\d{6}\/incident-report\.pdf$/,
    );
    expect(stored.metadata.sha256).toHaveLength(64);
    expect(stored.bytes).toEqual(bytes);
  });

  test("isolates objects by claim reference", async () => {
    const items = await listReferenceEvidence(CLAIM_A);
    const objectId = items[0]!.id;
    expect(await getReferenceEvidence(CLAIM_A, objectId)).not.toBeNull();
    expect(await getReferenceEvidence(CLAIM_B, objectId)).toBeNull();
  });

  test("rejects unsupported evidence and blocks infected evidence retrieval", async () => {
    const unsafeBytes = new TextEncoder().encode("synthetic infected fixture");

    await expect(
      storeReferenceEvidence({
        claimReference: CLAIM_A,
        category: "Other",
        title: "Unsupported",
        fileName: "payload.exe",
        mimeType: "application/octet-stream",
        bytes: unsafeBytes.buffer,
        uploadedBy: "Reference claimant",
        securityScan: "clean",
        legalHold: false,
      }),
    ).rejects.toThrow("Unsupported evidence file type");

    const infected = await storeReferenceEvidence({
      claimReference: CLAIM_A,
      category: "Other",
      title: "Synthetic blocked document",
      fileName: "blocked.pdf",
      mimeType: "application/pdf",
      bytes: unsafeBytes.buffer,
      uploadedBy: "Reference claimant",
      securityScan: "infected",
      legalHold: false,
    });

    expect(await getReferenceEvidence(CLAIM_A, infected.metadata.id)).toBeNull();
  });

  test("supports the existing pending-review transition and preserves legal hold", async () => {
    const bytes = new TextEncoder().encode("synthetic legal hold evidence");
    const stored = await storeReferenceEvidence({
      claimReference: CLAIM_A,
      category: "Correspondence",
      title: "Synthetic correspondence",
      fileName: "correspondence.pdf",
      mimeType: "application/pdf",
      bytes: bytes.buffer,
      uploadedBy: "Reference claimant",
      securityScan: "clean",
      legalHold: true,
    });

    const reviewed = await reviewReferenceEvidence({
      claimReference: CLAIM_A,
      objectId: stored.metadata.id,
      nextStatus: "Verified",
      reviewerId: "demo-staff-claims-001",
      reviewedAt: "2026-09-14T00:00:00.000Z",
    });

    expect(reviewed?.status).toBe("Verified");
    expect(reviewed?.legalHold).toBe(true);
    await expect(
      reviewReferenceEvidence({
        claimReference: CLAIM_A,
        objectId: stored.metadata.id,
        nextStatus: "Rejected",
        reviewerId: "demo-staff-claims-001",
      }),
    ).rejects.toThrow("Invalid evidence review transition");
  });

  test("reset restores the deterministic fixture state", async () => {
    const baseline = await listReferenceEvidence(CLAIM_A);
    const bytes = new TextEncoder().encode("temporary reference document");
    await storeReferenceEvidence({
      claimReference: CLAIM_A,
      category: "Other",
      title: "Temporary",
      fileName: "temporary.pdf",
      mimeType: "application/pdf",
      bytes: bytes.buffer,
      uploadedBy: "Reference claimant",
      securityScan: "clean",
      legalHold: false,
    });
    expect((await listReferenceEvidence(CLAIM_A)).length).toBe(baseline.length + 1);
    await resetReferenceEvidenceRepository();
    expect(await listReferenceEvidence(CLAIM_A)).toEqual(baseline);
  });
});
