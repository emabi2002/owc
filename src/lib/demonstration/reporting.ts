import {
  DEMONSTRATION_CLAIMS,
  type DemonstrationClaimStatus,
  type DemonstrationDecision,
} from "./data-pack";

const STATUSES: readonly DemonstrationClaimStatus[] = [
  "RECEIVED",
  "DOCUMENTS_REQUIRED",
  "ASSESSMENT",
  "APPROVED",
  "DECLINED",
  "PAYMENT_SCHEDULED",
  "SIMULATED_PAYMENT",
  "CLOSED",
] as const;

const DECISIONS: readonly DemonstrationDecision[] = ["PENDING", "APPROVED", "DECLINED"] as const;

export type DemonstrationReport = {
  environment: "DEMONSTRATION";
  syntheticData: true;
  productionAcceptance: false;
  totalClaims: number;
  statusCounts: Record<DemonstrationClaimStatus, number>;
  decisionCounts: Record<DemonstrationDecision, number>;
  notificationFailures: number;
  averageTurnaroundDays: number;
  completedSimulatedPayments: number;
  illustrativePaymentAmountPgk: number;
  paymentEvidence: {
    simulation: true;
    moneyMovement: false;
  };
};

export function buildDemonstrationReport(): DemonstrationReport {
  const statusCounts = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      DEMONSTRATION_CLAIMS.filter((claim) => claim.status === status).length,
    ]),
  ) as Record<DemonstrationClaimStatus, number>;

  const decisionCounts = Object.fromEntries(
    DECISIONS.map((decision) => [
      decision,
      DEMONSTRATION_CLAIMS.filter((claim) => claim.decision === decision).length,
    ]),
  ) as Record<DemonstrationDecision, number>;

  const averageTurnaroundDays = Number(
    (
      DEMONSTRATION_CLAIMS.reduce((sum, claim) => sum + claim.turnaroundDays, 0) /
      DEMONSTRATION_CLAIMS.length
    ).toFixed(2),
  );

  return {
    environment: "DEMONSTRATION",
    syntheticData: true,
    productionAcceptance: false,
    totalClaims: DEMONSTRATION_CLAIMS.length,
    statusCounts,
    decisionCounts,
    notificationFailures: DEMONSTRATION_CLAIMS.filter(
      (claim) => claim.notificationStatus === "FAILED",
    ).length,
    averageTurnaroundDays,
    completedSimulatedPayments: DEMONSTRATION_CLAIMS.filter(
      (claim) => claim.status === "SIMULATED_PAYMENT",
    ).length,
    illustrativePaymentAmountPgk: DEMONSTRATION_CLAIMS.reduce(
      (sum, claim) => sum + (claim.simulatedPaymentAmountPgk ?? 0),
      0,
    ),
    paymentEvidence: {
      simulation: true,
      moneyMovement: false,
    },
  };
}
