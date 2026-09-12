import {
  checkTaxCompliance,
  processSandboxPayment,
  sendSandboxNotification,
  verifyBankAccount,
  verifyEmployer,
  verifyEmployment,
  verifyIdentity,
  verifyInsurancePolicy,
  verifyMedicalCertificate,
} from "./agencies";
import {
  DEMO_BANK_ACCOUNT,
  DEMO_CLAIM_REFERENCE,
  DEMO_EMPLOYER,
  DEMO_EMPLOYMENT,
  DEMO_IDENTITY,
  DEMO_INSURANCE_POLICY,
  DEMO_MEDICAL_CERTIFICATE,
  DEMO_TAXPAYER,
} from "./data";

export type DemoStepKey =
  | "identity"
  | "employer_registry"
  | "tax_compliance"
  | "employment"
  | "medical"
  | "insurance"
  | "bank_account"
  | "payment"
  | "notification";

export interface DemoStep {
  key: DemoStepKey;
  label: string;
  status: "passed" | "failed";
  summary: string;
  correlationId: string;
}

export interface DemoScenarioResult {
  scenario: "worker_claim";
  status: "completed" | "stopped";
  claimReference: string;
  steps: DemoStep[];
  paymentTransactionReference: string | null;
}

export interface DemoScenarioOverrides {
  nid?: string;
  registrationNo?: string;
  tin?: string;
  employeeNo?: string;
  certificateNo?: string;
  policyNo?: string;
  accountReference?: string;
}

function stopped(claimReference: string, steps: DemoStep[]): DemoScenarioResult {
  return {
    scenario: "worker_claim",
    status: "stopped",
    claimReference,
    steps,
    paymentTransactionReference: null,
  };
}

export function runWorkerClaimDemo(
  overrides: DemoScenarioOverrides = {},
): DemoScenarioResult {
  const claimReference = DEMO_CLAIM_REFERENCE;
  const steps: DemoStep[] = [];

  const identity = verifyIdentity(overrides.nid ?? DEMO_IDENTITY.nid);
  const identityPassed = identity.data.matched === true;
  steps.push({
    key: "identity",
    label: "National identity verification",
    status: identityPassed ? "passed" : "failed",
    summary: identityPassed ? "Claimant identity verified" : "Claimant identity not found",
    correlationId: identity.correlationId,
  });
  if (!identityPassed) return stopped(claimReference, steps);

  const employer = verifyEmployer(overrides.registrationNo ?? DEMO_EMPLOYER.registrationNo);
  const employerPassed = employer.data.active === true;
  steps.push({
    key: "employer_registry",
    label: "Employer registration verification",
    status: employerPassed ? "passed" : "failed",
    summary: employerPassed ? "Employer registration active" : "Employer registration not verified",
    correlationId: employer.correlationId,
  });
  if (!employerPassed) return stopped(claimReference, steps);

  const tax = checkTaxCompliance(overrides.tin ?? DEMO_TAXPAYER.tin);
  const taxPassed = tax.data.status === "COMPLIANT";
  steps.push({
    key: "tax_compliance",
    label: "IRC tax compliance",
    status: taxPassed ? "passed" : "failed",
    summary: taxPassed ? "Employer tax status compliant" : "Tax compliance not verified",
    correlationId: tax.correlationId,
  });
  if (!taxPassed) return stopped(claimReference, steps);

  const employment = verifyEmployment(overrides.employeeNo ?? DEMO_EMPLOYMENT.employeeNo);
  const employmentPassed = employment.data.employed === true;
  steps.push({
    key: "employment",
    label: "Employment and wage verification",
    status: employmentPassed ? "passed" : "failed",
    summary: employmentPassed ? "Employment and wage details verified" : "Employment not verified",
    correlationId: employment.correlationId,
  });
  if (!employmentPassed) return stopped(claimReference, steps);

  const medical = verifyMedicalCertificate(
    overrides.certificateNo ?? DEMO_MEDICAL_CERTIFICATE.certificateNo,
  );
  const medicalPassed = medical.data.valid === true;
  steps.push({
    key: "medical",
    label: "Medical certificate verification",
    status: medicalPassed ? "passed" : "failed",
    summary: medicalPassed ? "Medical certificate valid" : "Medical certificate not verified",
    correlationId: medical.correlationId,
  });
  if (!medicalPassed) return stopped(claimReference, steps);

  const insurance = verifyInsurancePolicy(overrides.policyNo ?? DEMO_INSURANCE_POLICY.policyNo);
  const insurancePassed = insurance.data.active === true;
  steps.push({
    key: "insurance",
    label: "Workers compensation insurance",
    status: insurancePassed ? "passed" : "failed",
    summary: insurancePassed ? "Employer insurance policy active" : "Insurance policy not verified",
    correlationId: insurance.correlationId,
  });
  if (!insurancePassed) return stopped(claimReference, steps);

  const bank = verifyBankAccount(overrides.accountReference ?? DEMO_BANK_ACCOUNT.accountReference);
  const bankPassed = bank.data.verified === true;
  steps.push({
    key: "bank_account",
    label: "Bank account verification",
    status: bankPassed ? "passed" : "failed",
    summary: bankPassed ? "Claimant bank account verified" : "Bank account not verified",
    correlationId: bank.correlationId,
  });
  if (!bankPassed) return stopped(claimReference, steps);

  const payment = processSandboxPayment({
    idempotencyKey: `PAY-${claimReference}`,
    claimReference,
    accountReference: DEMO_BANK_ACCOUNT.accountReference,
    amountPgk: 18_450,
  });
  steps.push({
    key: "payment",
    label: "Compensation payment",
    status: "passed",
    summary: `K18,450.00 payment processed as ${payment.data.transactionReference}`,
    correlationId: payment.correlationId,
  });

  const notification = sendSandboxNotification({
    channel: "sms",
    recipient: "+67570000001",
    event: "PAYMENT_PROCESSED",
    message: `Payment for ${claimReference} has been processed.`,
  });
  steps.push({
    key: "notification",
    label: "Claimant notification",
    status: notification.data.accepted ? "passed" : "failed",
    summary: notification.data.accepted
      ? "SMS notification accepted for delivery"
      : "Notification could not be sent",
    correlationId: notification.correlationId,
  });

  return {
    scenario: "worker_claim",
    status: "completed",
    claimReference,
    steps,
    paymentTransactionReference: payment.data.transactionReference,
  };
}
