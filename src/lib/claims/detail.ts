import { getAdminClaims } from "@/lib/data/cms";
import { SEED_CLAIM } from "@/lib/db/seed";
import { getClaimEvidence } from "./evidence";

export async function getClaimDetail(reference: string) {
  const claims = await getAdminClaims();
  const claim = claims.find((item) => item.ref === reference) ?? null;
  if (!claim) return null;

  const evidence = await getClaimEvidence(reference);
  const isReferenceClaim = reference === SEED_CLAIM.reference;

  return {
    ...claim,
    injuryDate: isReferenceClaim ? SEED_CLAIM.injuryDate : "—",
    steps: isReferenceClaim
      ? SEED_CLAIM.steps
      : [
          { label: "Claim received", done: true, date: claim.lodged },
          {
            label: "Identity and employment verification",
            done: claim.status !== "New",
          },
          {
            label: "Medical evidence review",
            done: ["Approved", "Paid", "Declined"].includes(claim.status),
          },
          {
            label: "Determination",
            done: ["Approved", "Paid", "Declined"].includes(claim.status),
          },
          { label: "Compensation payment", done: claim.status === "Paid" },
        ],
    evidence,
  };
}
