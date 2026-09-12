import type { ClaimEvidence } from "./evidence";

export const EVIDENCE_REVIEW_STATUSES = ["Verified", "Rejected"] as const;
export type EvidenceReviewStatus = (typeof EVIDENCE_REVIEW_STATUSES)[number];

export function canTransitionEvidenceStatus(
  currentStatus: ClaimEvidence["status"],
  nextStatus: EvidenceReviewStatus,
): boolean {
  return currentStatus === "Pending Review" && EVIDENCE_REVIEW_STATUSES.includes(nextStatus);
}

export function buildEvidenceReviewUpdate(input: {
  currentStatus: ClaimEvidence["status"];
  nextStatus: EvidenceReviewStatus;
  reviewerId: string | null;
  reviewedAt?: string;
}) {
  if (!canTransitionEvidenceStatus(input.currentStatus, input.nextStatus)) {
    throw new Error("Invalid evidence review transition");
  }

  return {
    status: input.nextStatus,
    verified_by_id: input.reviewerId,
    verified_at: input.reviewedAt ?? new Date().toISOString(),
  };
}
