import { selectCppsBackend } from "../cpps/backend-mode";
import { createReferenceCppsService } from "../cpps/reference/service";
import { runWorkerClaimDemo } from "../integrations/sandbox/demo-scenario";
import type {
  ReferenceUatCheck,
  ReferenceUatScenario,
  ReferenceUatSuiteOptions,
  ReferenceUatSuiteResult,
} from "./types";

const MODE = "REFERENCE/SANDBOX" as const;
const REQUIRED_WORKER_STEPS = [
  "claim_registration",
  "identity",
  "employer_registry",
  "tax_compliance",
  "employment",
  "medical",
  "insurance",
  "bank_account",
  "record_reconciliation",
  "determination",
  "payment",
  "notification",
] as const;

function scenarioBase(
  id: ReferenceUatScenario["id"],
  title: string,
): Pick<
  ReferenceUatScenario,
  "id" | "title" | "mode" | "syntheticData" | "productionAcceptance"
> {
  return {
    id,
    title,
    mode: MODE,
    syntheticData: true,
    productionAcceptance: false,
  };
}

function checksFromWorkerDemo(result: ReturnType<typeof runWorkerClaimDemo>): ReferenceUatCheck[] {
  return result.steps.map((step) => ({
    key: step.key,
    label: step.label,
    status: step.status,
    summary: step.summary,
    correlationId: step.correlationId,
  }));
}

function runHappyPath(): ReferenceUatScenario {
  const result = runWorkerClaimDemo();
  const checks = checksFromWorkerDemo(result);
  const correctStepOrder =
    checks.length === REQUIRED_WORKER_STEPS.length &&
    REQUIRED_WORKER_STEPS.every((step, index) => checks[index]?.key === step);
  const passed =
    result.status === "completed" &&
    correctStepOrder &&
    checks.every((check) => check.status === "passed" && Boolean(check.correlationId));

  return {
    ...scenarioBase("REF-UAT-001", "Coherent worker compensation claim journey"),
    status: passed ? "passed" : "failed",
    checks,
    evidence: {
      claimReference: result.claimReference,
      paymentTransactionReference: result.paymentTransactionReference,
      stepCount: checks.length,
    },
  };
}

function runIdentityFailure(): ReferenceUatScenario {
  const result = runWorkerClaimDemo({ nid: "NID-UAT-NOT-FOUND" });
  const checks = checksFromWorkerDemo(result);
  const passed =
    result.status === "stopped" &&
    checks.length === 2 &&
    checks.at(-1)?.key === "identity" &&
    checks.at(-1)?.status === "failed" &&
    result.paymentTransactionReference === null;

  return {
    ...scenarioBase("REF-UAT-002", "Identity failure stops downstream processing"),
    status: passed ? "passed" : "failed",
    checks,
    evidence: {
      claimReference: result.claimReference,
      downstreamProcessingStopped: true,
      paymentTransactionReference: result.paymentTransactionReference,
    },
  };
}

function runRecordMismatch(): ReferenceUatScenario {
  const result = runWorkerClaimDemo({
    nid: "NID-00010001",
    registrationNo: "IPA-2018-2044",
    tin: "TIN-90010002",
    employeeNo: "EMP-0001002",
    certificateNo: "MED-2026-00452",
    policyNo: "WC-POL-2026-01903",
    accountReference: "BANK-ACC-3921",
  });
  const checks = checksFromWorkerDemo(result);
  const passed =
    result.status === "stopped" &&
    checks.at(-1)?.key === "record_reconciliation" &&
    checks.at(-1)?.status === "failed" &&
    result.paymentTransactionReference === null;

  return {
    ...scenarioBase("REF-UAT-003", "Cross-agency record mismatch is stopped"),
    status: passed ? "passed" : "failed",
    checks,
    evidence: {
      claimReference: result.claimReference,
      stoppedAt: checks.at(-1)?.key ?? null,
      paymentTransactionReference: result.paymentTransactionReference,
    },
  };
}

function runPaymentIdempotency(): ReferenceUatScenario {
  // Explicit UAT proof for synthetic payment idempotency.
  const first = runWorkerClaimDemo();
  const second = runWorkerClaimDemo();
  const passed =
    first.status === "completed" &&
    second.status === "completed" &&
    Boolean(first.paymentTransactionReference) &&
    first.paymentTransactionReference === second.paymentTransactionReference;

  return {
    ...scenarioBase("REF-UAT-004", "Synthetic payment idempotency"),
    status: passed ? "passed" : "failed",
    checks: [
      {
        key: "payment_idempotency",
        label: "Repeated synthetic payment request",
        status: passed ? "passed" : "failed",
        summary: passed
          ? "Repeated reference workflow reused the same synthetic transaction reference"
          : "Synthetic transaction reference changed or workflow did not complete",
      },
    ],
    evidence: {
      firstTransactionReference: first.paymentTransactionReference,
      secondTransactionReference: second.paymentTransactionReference,
      realFundsMoved: false,
    },
  };
}

function makeReferenceClaim(service: ReturnType<typeof createReferenceCppsService>) {
  return service.registerClaim({
    workerName: "Aila Reference Worker",
    workerPhone: "+67570000001",
    workerEmail: "aila.reference@example.invalid",
    employerName: "Pacific Engineering Demo Ltd",
    province: "National Capital District",
    occupation: "Reference Technician",
    weeklyWage: "750",
    injuryDate: "2026-08-20",
    injuryType: "Reference test injury",
    description: "Synthetic UAT claim used only for reference lifecycle verification.",
    documentCount: 2,
  });
}

function runReferenceCppsLifecycle(): ReferenceUatScenario {
  const service = createReferenceCppsService({
    now: () => new Date("2026-09-14T00:00:00.000Z"),
  });
  const registered = makeReferenceClaim(service);
  service.transitionClaim(registered.reference, "registration_review");
  service.transitionClaim(registered.reference, "medical_review");
  service.transitionClaim(registered.reference, "assessment");
  const assessed = service.assessClaim(registered.reference, 4);
  service.transitionClaim(registered.reference, "approved");
  service.transitionClaim(registered.reference, "payment_scheduled");
  const paid = service.recordSyntheticPayment(registered.reference);
  const closed = service.transitionClaim(registered.reference, "closed");

  const passed =
    assessed.assessment?.basis.includes("REFERENCE ASSUMPTION ONLY") === true &&
    paid.payment?.realFundsMoved === false &&
    closed.state === "closed";

  return {
    ...scenarioBase("REF-UAT-005", "Reference CPPS lifecycle through synthetic payment and closure"),
    status: passed ? "passed" : "failed",
    checks: closed.events.map((event, index) => ({
      key: `cpps_event_${index + 1}`,
      label: event.event,
      status: "passed" as const,
      summary: `${event.fromState ?? "none"} -> ${event.toState}`,
    })),
    evidence: {
      claimReference: closed.reference,
      assessmentAmount: assessed.assessment?.amount ?? null,
      assessmentBasis: assessed.assessment?.basis ?? null,
      paymentReference: paid.payment?.reference ?? null,
      realFundsMoved: paid.payment?.realFundsMoved ?? false,
      finalState: closed.state,
    },
  };
}

function runInvalidTransition(): ReferenceUatScenario {
  // UAT proof that an invalid transition cannot bypass the reference CPPS lifecycle.
  const service = createReferenceCppsService({
    now: () => new Date("2026-09-14T00:00:00.000Z"),
  });
  const claim = makeReferenceClaim(service);
  let rejected = false;
  let errorSummary = "";

  try {
    service.transitionClaim(claim.reference, "approved");
  } catch (error) {
    rejected = true;
    errorSummary = error instanceof Error ? error.message : "Invalid transition rejected";
  }

  return {
    ...scenarioBase("REF-UAT-006", "Reference CPPS invalid transition is rejected"),
    status: rejected ? "passed" : "failed",
    checks: [
      {
        key: "invalid_transition",
        label: "Impossible state jump",
        status: rejected ? "passed" : "failed",
        summary: rejected ? "Reference CPPS rejected received -> approved" : "Invalid transition was accepted",
      },
    ],
    evidence: { rejected, errorSummary },
  };
}

function runBackendSelection(): ReferenceUatScenario {
  const liveConfigured = selectCppsBackend({ liveConfigured: true, referenceEnabled: true });
  const referenceOnly = selectCppsBackend({ liveConfigured: false, referenceEnabled: true });
  const neitherConfigured = selectCppsBackend({ liveConfigured: false, referenceEnabled: false });
  const passed =
    liveConfigured === "live" &&
    referenceOnly === "reference" &&
    neitherConfigured === "unavailable";

  return {
    ...scenarioBase("REF-UAT-007", "Explicit CPPS backend selection without silent fallback"),
    status: passed ? "passed" : "failed",
    checks: [
      {
        key: "backend_selection",
        label: "Live/reference/unavailable selection",
        status: passed ? "passed" : "failed",
        summary: passed
          ? "Live wins, reference requires explicit enablement, otherwise CPPS is unavailable"
          : "CPPS backend selection did not match the approved fail-closed contract",
      },
    ],
    evidence: { liveConfigured, referenceOnly, neitherConfigured },
  };
}

export function runReferenceUatSuite(
  options: ReferenceUatSuiteOptions = {},
): ReferenceUatSuiteResult {
  const scenarios: ReferenceUatScenario[] = [
    runHappyPath(),
    runIdentityFailure(),
    runRecordMismatch(),
    runPaymentIdempotency(),
    runReferenceCppsLifecycle(),
    runInvalidTransition(),
    runBackendSelection(),
  ];
  const passed = scenarios.filter((scenario) => scenario.status === "passed").length;
  const failed = scenarios.length - passed;

  return {
    suite: "OWC_REFERENCE_END_TO_END_UAT",
    mode: MODE,
    syntheticData: true,
    productionAcceptance: false,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    releaseSha: options.releaseSha ?? null,
    notice:
      "REFERENCE/SANDBOX evidence only. Synthetic data and synthetic payment are used; production acceptance and live agency interoperability are not implied.",
    scenarios,
    summary: {
      total: scenarios.length,
      passed,
      failed,
      status: failed === 0 ? "passed" : "failed",
    },
  };
}
