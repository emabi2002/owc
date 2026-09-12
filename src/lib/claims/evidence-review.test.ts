import { describe, expect, test } from "bun:test";
import {
  EVIDENCE_REVIEW_STATUSES,
  buildEvidenceReviewUpdate,
  canTransitionEvidenceStatus,
} from "./evidence-review";

describe("claim evidence review workflow", () => {
  test("allows claims officers to verify or reject pending evidence", () => {
    expect(canTransitionEvidenceStatus("Pending Review", "Verified")).toBe(true);
    expect(canTransitionEvidenceStatus("Pending Review", "Rejected")).toBe(true);
  });

  test("prevents silent changes to terminal review outcomes", () => {
    expect(canTransitionEvidenceStatus("Verified", "Rejected")).toBe(false);
    expect(canTransitionEvidenceStatus("Rejected", "Verified")).toBe(false);
  });

  test("builds reviewer metadata for accepted review statuses", () => {
    const update = buildEvidenceReviewUpdate({
      currentStatus: "Pending Review",
      nextStatus: "Verified",
      reviewerId: "11111111-1111-1111-1111-111111111111",
      reviewedAt: "2026-09-12T12:00:00.000Z",
    });

    expect(EVIDENCE_REVIEW_STATUSES).toContain(update.status);
    expect(update.verified_by_id).toBe("11111111-1111-1111-1111-111111111111");
    expect(update.verified_at).toBe("2026-09-12T12:00:00.000Z");
  });
});
