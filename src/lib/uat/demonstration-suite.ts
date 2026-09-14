import { scanReferenceEvidenceBytes } from "@/lib/claims/reference-malware-scanner";
import { DEMONSTRATION_CLAIMS } from "@/lib/demonstration/data-pack";
import {
  listSandboxPayments,
  resetSandboxPayments,
} from "@/lib/integrations/sandbox/agencies";
import { runWorkerClaimDemo } from "@/lib/integrations/sandbox/demo-scenario";
import {
  getSandboxServiceStatus,
  resetSandboxServiceStatuses,
  setSandboxServiceStatus,
} from "@/lib/integrations/sandbox/state";

export type DemonstrationUatScenario = {
  id: `DEMO-UAT-00${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
  title: string;
  status: "passed" | "failed";
  syntheticData: true;
  demonstrationAcceptance: true;
  productionAcceptance: false;
  evidence: Record<string, unknown>;
};

export type DemonstrationUatResult = {
  suite: "OWC_DEMONSTRATION_END_TO_END_UAT";
  environment: "DEMONSTRATION";
  syntheticData: true;
  demonstrationAcceptance: true;
  productionAcceptance: false;
  generatedAt: string;
  releaseSha: string | null;
  notice: string;
  scenarios: DemonstrationUatScenario[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    status: "passed" | "failed";
  };
};

export type DemonstrationUatOptions = {
  releaseSha?: string | null;
  generatedAt?: string;
};

function scenario(
  id: DemonstrationUatScenario["id"],
  title: string,
  passed: boolean,
  evidence: Record<string, unknown>,
): DemonstrationUatScenario {
  return {
    id,
    title,
    status: passed ? "passed" : "failed",
    syntheticData: true,
    demonstrationAcceptance: true,
    productionAcceptance: false,
    evidence,
  };
}

function runHappyPath() {
  resetSandboxPayments();
  const result = runWorkerClaimDemo();
  const payment = listSandboxPayments()[0];
  const passed =
    result.status === "completed" &&
    result.steps.length === 12 &&
    result.steps.every((step) => step.status === "passed") &&
    Boolean(payment) &&
    payment.simulation === true &&
    payment.moneyMovement === false;

  return scenario("DEMO-UAT-001", "Successful claim from verification through simulated payment", passed, {
    claimReference: result.claimReference,
    stepCount: result.steps.length,
    transactionReference: result.paymentTransactionReference,
    simulation: payment?.simulation ?? null,
    moneyMovement: payment?.moneyMovement ?? null,
  });
}

function runMissingDocuments() {
  const claim = DEMONSTRATION_CLAIMS.find((item) => item.status === "DOCUMENTS_REQUIRED");
  const passed = Boolean(claim && claim.assessmentOutstanding && claim.decision === "PENDING");
  return scenario("DEMO-UAT-002", "Missing documents hold the claim before determination", passed, {
    claimReference: claim?.reference ?? null,
    status: claim?.status ?? null,
    assessmentOutstanding: claim?.assessmentOutstanding ?? null,
  });
}

function runIdentityMismatch() {
  const result = runWorkerClaimDemo({ nid: "NID-DEMO-NOT-FOUND" });
  const last = result.steps.at(-1);
  const passed =
    result.status === "stopped" &&
    last?.key === "identity" &&
    last.status === "failed" &&
    result.paymentTransactionReference === null;
  return scenario("DEMO-UAT-003", "Identity mismatch stops downstream claim processing", passed, {
    claimReference: result.claimReference,
    stoppedAt: last?.key ?? null,
    paymentTransactionReference: result.paymentTransactionReference,
  });
}

async function runInfectedEvidence() {
  const marker = new TextEncoder().encode(
    "OWC synthetic fixture EICAR-STANDARD-ANTIVIRUS-TEST-FILE presentation marker",
  );
  const result = await scanReferenceEvidenceBytes(marker.buffer);
  const passed =
    result.status === "infected" &&
    result.source === "reference" &&
    result.productionConnected === false;
  return scenario("DEMO-UAT-004", "Infected evidence is detected and blocked by the reference scanner", passed, {
    scanStatus: result.status,
    threat: result.status === "infected" ? result.threat : null,
    source: result.source,
    productionConnected: result.productionConnected,
  });
}

function runDeclinedClaim() {
  const claim = DEMONSTRATION_CLAIMS.find(
    (item) => item.status === "DECLINED" && item.decision === "DECLINED",
  );
  const passed = Boolean(claim && claim.simulatedPaymentAmountPgk === null);
  return scenario("DEMO-UAT-005", "Declined claim records a decision without payment", passed, {
    claimReference: claim?.reference ?? null,
    status: claim?.status ?? null,
    decision: claim?.decision ?? null,
    simulatedPaymentAmountPgk: claim?.simulatedPaymentAmountPgk ?? null,
  });
}

function runPaymentIdempotency() {
  resetSandboxPayments();
  const first = runWorkerClaimDemo();
  const second = runWorkerClaimDemo();
  const payments = listSandboxPayments();
  const payment = payments[0];
  const passed =
    first.status === "completed" &&
    second.status === "completed" &&
    first.paymentTransactionReference === second.paymentTransactionReference &&
    payments.length === 1 &&
    payment?.simulation === true &&
    payment.moneyMovement === false &&
    payment.transactionReference.startsWith("SIM-PAY-");

  return scenario("DEMO-UAT-006", "Simulated payment idempotency prevents duplicate transactions", passed, {
    transactionReference: payment?.transactionReference ?? null,
    receiptReference: payment?.receiptReference ?? null,
    paymentRecordCount: payments.length,
    simulation: payment?.simulation ?? null,
    moneyMovement: payment?.moneyMovement ?? null,
  });
}

function runOutageRecovery() {
  resetSandboxServiceStatuses();
  setSandboxServiceStatus("nid", "offline");
  const outageObserved = getSandboxServiceStatus("nid") === "offline";
  resetSandboxServiceStatuses();
  const recovered = getSandboxServiceStatus("nid") === "online";
  return scenario("DEMO-UAT-007", "External-service outage and recovery return to a clean presentation state", outageObserved && recovered, {
    service: "nid",
    outageObserved,
    recovered,
    finalStatus: getSandboxServiceStatus("nid"),
  });
}

export async function runDemonstrationUatSuite(
  options: DemonstrationUatOptions = {},
): Promise<DemonstrationUatResult> {
  resetSandboxPayments();
  resetSandboxServiceStatuses();

  const scenarios: DemonstrationUatScenario[] = [
    runHappyPath(),
    runMissingDocuments(),
    runIdentityMismatch(),
    await runInfectedEvidence(),
    runDeclinedClaim(),
    runPaymentIdempotency(),
    runOutageRecovery(),
  ];

  const passed = scenarios.filter((item) => item.status === "passed").length;
  const failed = scenarios.length - passed;

  return {
    suite: "OWC_DEMONSTRATION_END_TO_END_UAT",
    environment: "DEMONSTRATION",
    syntheticData: true,
    demonstrationAcceptance: failed === 0,
    productionAcceptance: false,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    releaseSha: options.releaseSha ?? null,
    notice:
      "DEMONSTRATION evidence only. All records, external-service responses and payments are synthetic; no production acceptance or real financial settlement is implied.",
    scenarios,
    summary: {
      total: scenarios.length,
      passed,
      failed,
      status: failed === 0 ? "passed" : "failed",
    },
  };
}
