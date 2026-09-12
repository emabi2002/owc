import {
  canTransitionClaim,
  type ClaimWorkflowStatus,
} from "./workflow";
import {
  notificationEventForTransition,
  type ClaimNotificationEvent,
} from "./notifications";

export type ClaimTransitionPlan =
  | {
      ok: true;
      from: ClaimWorkflowStatus;
      to: ClaimWorkflowStatus;
      notificationEvent: ClaimNotificationEvent | null;
    }
  | {
      ok: false;
      from: ClaimWorkflowStatus;
      to: ClaimWorkflowStatus;
      reason: string;
    };

export function planClaimTransition(
  from: ClaimWorkflowStatus,
  to: ClaimWorkflowStatus,
): ClaimTransitionPlan {
  if (!canTransitionClaim(from, to)) {
    return {
      ok: false,
      from,
      to,
      reason: `Claim cannot move from ${from} to ${to}`,
    };
  }

  return {
    ok: true,
    from,
    to,
    notificationEvent: notificationEventForTransition(from, to),
  };
}
