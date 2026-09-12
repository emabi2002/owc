export type ClaimWorkflowStatus =
  | "New"
  | "Awaiting Documents"
  | "Under Assessment"
  | "Approved"
  | "Declined"
  | "Paid";

const TRANSITIONS: Record<ClaimWorkflowStatus, readonly ClaimWorkflowStatus[]> = {
  New: ["Awaiting Documents", "Under Assessment"],
  "Awaiting Documents": ["Under Assessment"],
  "Under Assessment": ["Awaiting Documents", "Approved", "Declined"],
  Approved: ["Paid"],
  Declined: [],
  Paid: [],
};

export function allowedClaimTransitions(
  status: ClaimWorkflowStatus,
): ClaimWorkflowStatus[] {
  return [...TRANSITIONS[status]];
}

export function canTransitionClaim(
  from: ClaimWorkflowStatus,
  to: ClaimWorkflowStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isClaimWorkflowStatus(value: string): value is ClaimWorkflowStatus {
  return value in TRANSITIONS;
}
