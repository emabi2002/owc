import { listDemoPrincipals, type DemoPersonaId } from "@/lib/auth/demo-identity";

const ROUTE_BY_PERSONA: Record<DemoPersonaId, string> = {
  administrator: "/admin/demonstration",
  "claims-officer": "/admin/demonstration/officer?persona=claims-officer",
  "assessment-officer": "/admin/demonstration/officer?persona=assessment-officer",
  "finance-officer": "/admin/demonstration/officer?persona=finance-officer",
  "content-editor": "/admin/content",
  "management-executive": "/management/reports",
  "employer-representative": "/employer",
  "claimant-worker": "/claims",
};

const SCENARIOS = [
  { id: "DEMO-UAT-001", title: "Successful claim through simulated payment" },
  { id: "DEMO-UAT-002", title: "Missing documents hold the claim" },
  { id: "DEMO-UAT-003", title: "Identity mismatch stops processing" },
  { id: "DEMO-UAT-004", title: "Infected evidence is blocked" },
  { id: "DEMO-UAT-005", title: "Declined claim records no payment" },
  { id: "DEMO-UAT-006", title: "Simulated payment is idempotent" },
  { id: "DEMO-UAT-007", title: "Sandbox outage and recovery" },
] as const;

export function buildPresentationGuide() {
  return {
    environment: "DEMONSTRATION" as const,
    syntheticData: true as const,
    productionAcceptance: false as const,
    personas: listDemoPrincipals().map((principal) => ({
      personaId: principal.personaId,
      fullName: principal.fullName,
      principalType: principal.principalType,
      role: principal.role,
      route: ROUTE_BY_PERSONA[principal.personaId],
      mfaRequired: principal.mfaRequired,
      scopes: principal.scopes,
    })),
    scenarios: SCENARIOS,
    boundaries: [
      "All claimant, employer, agency and payment records shown in the presentation are synthetic.",
      "No real funds move",
      "productionAcceptance=false",
      "Simulated payments require simulation=true and moneyMovement=false.",
      "External agency responses are reference/sandbox responses, not live agency confirmations.",
      "DEMO_HOST_EXTERNAL",
      "The repository release remains DEMO_HOST_EXTERNAL until an actual presentation host is configured and independently verified.",
    ],
    recovery: {
      instruction: "Use Administrator-only sandbox service controls or the guarded whole-demonstration reset to restore a known presentation state.",
      productionConnected: false as const,
    },
  };
}
