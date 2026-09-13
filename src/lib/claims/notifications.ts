import type { ClaimWorkflowStatus } from "./workflow";

export type ClaimNotificationEvent =
  | "CLAIM_RECEIVED"
  | "ASSESSMENT_STARTED"
  | "DOCUMENT_REQUIRED"
  | "CLAIM_APPROVED"
  | "CLAIM_DECLINED"
  | "PAYMENT_PROCESSED"
  | "CLAIM_CLOSED";

export type ClaimNotification = {
  event: ClaimNotificationEvent;
  claimReference: string;
  claimantName?: string;
  subject: string;
  message: string;
};

const TRANSITION_EVENTS: Partial<
  Record<ClaimWorkflowStatus, Partial<Record<ClaimWorkflowStatus, ClaimNotificationEvent>>>
> = {
  New: {
    "Under Assessment": "ASSESSMENT_STARTED",
    "Awaiting Documents": "DOCUMENT_REQUIRED",
  },
  "Awaiting Documents": {
    "Under Assessment": "ASSESSMENT_STARTED",
  },
  "Under Assessment": {
    "Awaiting Documents": "DOCUMENT_REQUIRED",
    Approved: "CLAIM_APPROVED",
    Declined: "CLAIM_DECLINED",
  },
  Approved: {
    Paid: "PAYMENT_PROCESSED",
  },
};

export function notificationEventForTransition(
  from: ClaimWorkflowStatus,
  to: ClaimWorkflowStatus,
): ClaimNotificationEvent | null {
  return TRANSITION_EVENTS[from]?.[to] ?? null;
}

export function buildClaimNotification(input: {
  event: ClaimNotificationEvent;
  claimReference: string;
  claimantName?: string;
}): ClaimNotification {
  const reference = input.claimReference.trim().toUpperCase();
  const greeting = input.claimantName?.trim()
    ? `Dear ${input.claimantName.trim()}, `
    : "";

  const copy: Record<
    ClaimNotificationEvent,
    { subject: string; message: string }
  > = {
    CLAIM_RECEIVED: {
      subject: `OWC claim ${reference} received`,
      message: `${greeting}your workers compensation claim ${reference} has been received and registered for processing.`,
    },
    ASSESSMENT_STARTED: {
      subject: `OWC claim ${reference} assessment started`,
      message: `${greeting}assessment of your workers compensation claim ${reference} has started.`,
    },
    DOCUMENT_REQUIRED: {
      subject: `OWC claim ${reference} requires additional information`,
      message: `${greeting}additional information is required to continue processing your workers compensation claim ${reference}. Please follow the instructions provided by OWC.`,
    },
    CLAIM_APPROVED: {
      subject: `OWC claim ${reference} approved`,
      message: `${greeting}your workers compensation claim ${reference} has been approved. OWC will continue with the next processing stage.`,
    },
    CLAIM_DECLINED: {
      subject: `OWC claim ${reference} decision issued`,
      message: `${greeting}a decision has been issued for your workers compensation claim ${reference}. Please sign in or contact OWC for the formal decision notice and next steps.`,
    },
    PAYMENT_PROCESSED: {
      subject: `OWC claim ${reference} payment processed`,
      message: `${greeting}payment processing for your workers compensation claim ${reference} has been completed. Please allow normal banking processing time where applicable.`,
    },
    CLAIM_CLOSED: {
      subject: `OWC claim ${reference} closed`,
      message: `${greeting}processing of your workers compensation claim ${reference} has been completed and the claim is now closed.`,
    },
  };

  return {
    event: input.event,
    claimReference: reference,
    claimantName: input.claimantName,
    ...copy[input.event],
  };
}
