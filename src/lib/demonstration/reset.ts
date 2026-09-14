import { resetDemoIdentityEvents } from "@/lib/auth/demo-identity";
import { resetReferenceEvidenceRepository } from "@/lib/claims/reference-evidence-repository";
import { resetReferenceNotificationDeliveries } from "@/lib/claims/reference-notification-gateway";
import { resetReferenceCppsRuntime } from "@/lib/cpps/reference/runtime";
import { resetSandboxPayments } from "@/lib/integrations/sandbox/agencies";
import { clearIntegrationEvents } from "@/lib/integrations/sandbox/events";
import { resetSandboxServiceStatuses } from "@/lib/integrations/sandbox/state";
import { DEMONSTRATION_CLAIMS } from "./data-pack";

export type DemonstrationResetConfiguration = {
  identityMode?: string;
  resetEnabled?: string;
};

export type DemonstrationResetReport = {
  source: "demonstration";
  synthetic: true;
  productionConnected: false;
  durable: false;
  resetAt: string;
  claimPackCount: number;
  subsystems: readonly [
    "identity-audit",
    "reference-cpps",
    "reference-evidence",
    "reference-notifications",
    "simulated-payments",
    "integration-events",
    "integration-service-state",
  ];
};

export function isDemonstrationResetEnabled(
  configuration: DemonstrationResetConfiguration = {
    identityMode: process.env.OWC_IDENTITY_MODE,
    resetEnabled: process.env.OWC_ENABLE_DEMO_RESET,
  },
): boolean {
  return (
    configuration.identityMode === "demonstration" &&
    configuration.resetEnabled === "true"
  );
}

/**
 * Clears only process-local synthetic presentation state. It never connects to
 * or mutates live OWC, agency, claimant, banking or production storage systems.
 */
export async function resetDemonstrationEnvironment(): Promise<DemonstrationResetReport> {
  if (!isDemonstrationResetEnabled()) {
    throw new Error("OWC demonstration reset is disabled");
  }

  resetDemoIdentityEvents();
  resetReferenceCppsRuntime();
  await resetReferenceEvidenceRepository();
  resetReferenceNotificationDeliveries();
  resetSandboxPayments();
  clearIntegrationEvents();
  resetSandboxServiceStatuses();

  return {
    source: "demonstration",
    synthetic: true,
    productionConnected: false,
    durable: false,
    resetAt: new Date().toISOString(),
    claimPackCount: DEMONSTRATION_CLAIMS.length,
    subsystems: [
      "identity-audit",
      "reference-cpps",
      "reference-evidence",
      "reference-notifications",
      "simulated-payments",
      "integration-events",
      "integration-service-state",
    ],
  };
}
