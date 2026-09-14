import type { DemoPersonaId } from "@/lib/auth/demo-identity";
import {
  DEMONSTRATION_CLAIMS,
  type DemonstrationClaim,
  type DemonstrationClaimStatus,
} from "./data-pack";

export type OfficerWorkbenchPersona = Extract<
  DemoPersonaId,
  "claims-officer" | "assessment-officer" | "finance-officer"
>;

const STATUS_BY_PERSONA: Record<OfficerWorkbenchPersona, readonly DemonstrationClaimStatus[]> = {
  "claims-officer": ["RECEIVED", "DOCUMENTS_REQUIRED"],
  "assessment-officer": ["ASSESSMENT"],
  "finance-officer": ["APPROVED", "PAYMENT_SCHEDULED", "SIMULATED_PAYMENT"],
};

export type DemonstrationOfficerWorkbench = {
  environment: "DEMONSTRATION";
  syntheticData: true;
  productionAcceptance: false;
  personaId: OfficerWorkbenchPersona;
  allowedStatuses: readonly DemonstrationClaimStatus[];
  claims: readonly DemonstrationClaim[];
  simulation: true;
  moneyMovement: false;
  readOnlyPresentation: true;
};

export function isOfficerWorkbenchPersona(value: string): value is OfficerWorkbenchPersona {
  return value === "claims-officer" || value === "assessment-officer" || value === "finance-officer";
}

export function buildOfficerWorkbench(
  personaId: OfficerWorkbenchPersona,
): DemonstrationOfficerWorkbench {
  const allowedStatuses = STATUS_BY_PERSONA[personaId];
  return {
    environment: "DEMONSTRATION",
    syntheticData: true,
    productionAcceptance: false,
    personaId,
    allowedStatuses,
    claims: DEMONSTRATION_CLAIMS.filter((claim) => allowedStatuses.includes(claim.status)),
    simulation: true,
    moneyMovement: false,
    readOnlyPresentation: true,
  };
}

export function findDemonstrationClaim(reference: string): DemonstrationClaim | null {
  return DEMONSTRATION_CLAIMS.find((claim) => claim.reference === reference) ?? null;
}
