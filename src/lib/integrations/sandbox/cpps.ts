import { makeSandboxEnvelope } from "./service";

export function registerClaimProcessing(input: {
  claimReference: string;
  workerName: string;
  employerName: string;
}) {
  return makeSandboxEnvelope("cpps", "register_claim", {
    accepted: true,
    claimReference: input.claimReference,
    workerName: input.workerName,
    employerName: input.employerName,
    status: "UNDER_ASSESSMENT" as const,
    registeredAt: new Date().toISOString(),
  });
}

export function recordClaimDetermination(input: {
  claimReference: string;
  approvedAmountPgk: number;
}) {
  return makeSandboxEnvelope("cpps", "record_determination", {
    accepted: true,
    claimReference: input.claimReference,
    determination: "APPROVED" as const,
    approvedAmountPgk: input.approvedAmountPgk,
    recordedAt: new Date().toISOString(),
  });
}
