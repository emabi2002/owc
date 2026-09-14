import { runDemonstrationUatSuite } from "@/lib/uat/demonstration-suite";
import { buildDemonstrationReport } from "./reporting";
import { buildPresentationGuide } from "./presentation";
import {
  DEMONSTRATION_BANNER,
  verifyDemonstrationTerminology,
} from "./terminology";

const HOST_KEYS = ["DEPLOY_HOST", "DEPLOY_USER", "DEPLOY_PATH", "DEPLOY_SSH_KEY"] as const;
type HostKey = (typeof HOST_KEYS)[number];

export type DemonstrationHostConfiguration = Partial<Record<HostKey, string>>;

export type DemonstrationReleaseOptions = {
  releaseSha?: string | null;
  generatedAt?: string;
  hostConfiguration?: DemonstrationHostConfiguration;
};

export async function buildDemonstrationRelease(
  options: DemonstrationReleaseOptions = {},
) {
  const hostConfiguration = options.hostConfiguration ?? {
    DEPLOY_HOST: process.env.DEPLOY_HOST,
    DEPLOY_USER: process.env.DEPLOY_USER,
    DEPLOY_PATH: process.env.DEPLOY_PATH,
    DEPLOY_SSH_KEY: process.env.DEPLOY_SSH_KEY,
  };
  const missing = HOST_KEYS.filter((key) => !hostConfiguration[key]?.trim());
  const configured = missing.length === 0;
  const host = {
    configured,
    verified: false as const,
    missing,
  };

  const uat = await runDemonstrationUatSuite({
    releaseSha: options.releaseSha ?? null,
    generatedAt: options.generatedAt,
  });
  const report = buildDemonstrationReport();
  const presentation = buildPresentationGuide();
  const terminology = verifyDemonstrationTerminology(
    `${DEMONSTRATION_BANNER}. Synthetic presentation only. Simulated payment only. productionAcceptance=false. moneyMovement=false.`,
  );

  const demonstrationAcceptance =
    uat.summary.status === "passed" &&
    report.syntheticData === true &&
    report.productionAcceptance === false &&
    report.paymentEvidence.moneyMovement === false &&
    presentation.syntheticData === true &&
    presentation.productionAcceptance === false &&
    terminology.ok;

  return {
    release: "OWC_DEMONSTRATION_RELEASE" as const,
    releaseStatus: configured
      ? ("REPOSITORY_READY / DEMO_HOST_CONFIGURED_PENDING_EXTERNAL_VERIFICATION" as const)
      : ("REPOSITORY_READY / DEMO_HOST_EXTERNAL" as const),
    environment: "DEMONSTRATION" as const,
    syntheticData: true as const,
    demonstrationAcceptance,
    productionAcceptance: false as const,
    moneyMovement: false as const,
    simulation: true as const,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    releaseSha: options.releaseSha ?? null,
    banner: DEMONSTRATION_BANNER,
    host,
    uat,
    reporting: report,
    presentation: {
      personaCount: presentation.personas.length,
      scenarioCount: presentation.scenarios.length,
      boundaries: presentation.boundaries,
    },
    terminology,
    notice:
      "Repository-side OWC demonstration evidence only. This release does not constitute production acceptance, live agency certification, real financial settlement, or proof of an independently verified OWC demonstration host.",
  };
}
