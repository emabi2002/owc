import type { ReferenceCppsClaim } from "./types";

export type ReferenceCppsStore = {
  get(reference: string): ReferenceCppsClaim | undefined;
  save(claim: ReferenceCppsClaim): void;
};

function cloneClaim(claim: ReferenceCppsClaim): ReferenceCppsClaim {
  return {
    ...claim,
    assessment: claim.assessment ? { ...claim.assessment } : undefined,
    payment: claim.payment ? { ...claim.payment } : undefined,
    events: claim.events.map((event) => ({ ...event })),
  };
}

export function createReferenceCppsStore(): ReferenceCppsStore {
  const claims = new Map<string, ReferenceCppsClaim>();

  return {
    get(reference) {
      const claim = claims.get(reference.trim().toUpperCase());
      return claim ? cloneClaim(claim) : undefined;
    },
    save(claim) {
      claims.set(claim.reference.toUpperCase(), cloneClaim(claim));
    },
  };
}
