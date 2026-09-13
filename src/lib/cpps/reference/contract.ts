import type { CppsClaimStatus, CppsClaimStep } from "../types";
import type { ReferenceCppsClaim, ReferenceCppsState } from "./types";

const STATE_LABELS: Record<ReferenceCppsState, string> = {
  received: "Received",
  registration_review: "Registration Review",
  medical_review: "Medical Review",
  assessment: "Under Assessment",
  approved: "Approved",
  rejected: "Rejected",
  payment_scheduled: "Payment Scheduled",
  paid: "Paid",
  closed: "Closed",
};

const STATE_PROGRESS: Record<ReferenceCppsState, number> = {
  received: 0,
  registration_review: 1,
  medical_review: 2,
  assessment: 3,
  approved: 4,
  rejected: 4,
  payment_scheduled: 5,
  paid: 5,
  closed: 6,
};

function firstEventDate(
  claim: ReferenceCppsClaim,
  state: ReferenceCppsState | ReferenceCppsState[],
): string | undefined {
  const states = Array.isArray(state) ? state : [state];
  return claim.events.find((event) => states.includes(event.toState))?.at;
}

function buildSteps(claim: ReferenceCppsClaim): CppsClaimStep[] {
  const progress = STATE_PROGRESS[claim.state];
  const rejected = claim.state === "rejected" ||
    (claim.state === "closed" && claim.events.some((event) => event.toState === "rejected"));

  return [
    {
      label: "Claim received",
      done: progress >= 0,
      date: firstEventDate(claim, "received"),
    },
    {
      label: "Registration review",
      done: progress >= 1,
      date: firstEventDate(claim, "registration_review"),
    },
    {
      label: "Medical review",
      done: progress >= 2,
      date: firstEventDate(claim, "medical_review"),
    },
    {
      label: "Assessment",
      done: progress >= 3,
      date: firstEventDate(claim, "assessment"),
    },
    {
      label: "Decision",
      done: progress >= 4,
      date: firstEventDate(claim, ["approved", "rejected"]),
    },
    {
      label: "Payment",
      done: !rejected && progress >= 5,
      date: rejected ? undefined : firstEventDate(claim, ["payment_scheduled", "paid"]),
    },
    {
      label: "Closed",
      done: progress >= 6,
      date: firstEventDate(claim, "closed"),
    },
  ];
}

export function toCppsClaimStatus(claim: ReferenceCppsClaim): CppsClaimStatus {
  return {
    reference: claim.reference,
    worker: claim.workerName,
    employer: claim.employerName,
    injuryDate: claim.injuryDate,
    lodged: claim.receivedAt,
    type: claim.injuryType ?? "Workplace injury",
    status: STATE_LABELS[claim.state],
    steps: buildSteps(claim),
  };
}
