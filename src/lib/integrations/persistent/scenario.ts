import { validateIntegrationCoherence } from "../sandbox/coherence";
import { recordClaimDetermination, registerClaimProcessing } from "../sandbox/cpps";
import {
  DEMO_BANK_ACCOUNT,
  DEMO_CLAIM_REFERENCE,
  DEMO_EMPLOYER,
  DEMO_EMPLOYMENT,
  DEMO_IDENTITY,
  DEMO_INSURANCE_POLICY,
  DEMO_MEDICAL_CERTIFICATE,
  DEMO_TAXPAYER,
} from "../sandbox/data";
import type {
  DemoScenarioOverrides,
  DemoScenarioResult,
  DemoStep,
} from "../sandbox/demo-scenario";
import {
  checkTaxComplianceIntegration,
  processSandboxPaymentIntegration,
  sendSandboxNotificationIntegration,
  verifyBankAccountIntegration,
  verifyEmployerIntegration,
  verifyEmploymentIntegration,
  verifyIdentityIntegration,
  verifyInsurancePolicyIntegration,
  verifyMedicalCertificateIntegration,
} from "./gateway";
import type {
  PersistentNotificationInput,
  PersistentPaymentInput,
  PersistentServiceName,
} from "./types";

type LookupService = Exclude<PersistentServiceName, "notifications">;

interface ScenarioEnvelope {
  correlationId: string;
  data: Record<string, unknown>;
}

export interface PersistentScenarioGateway {
  lookup(service: LookupService, identifier: string): Promise<ScenarioEnvelope>;
  processPayment(input: PersistentPaymentInput): Promise<ScenarioEnvelope>;
  sendNotification(input: PersistentNotificationInput): Promise<ScenarioEnvelope>;
}

const defaultGateway: PersistentScenarioGateway = {
  lookup(service, identifier) {
    switch (service) {
      case "nid": return verifyIdentityIntegration(identifier);
      case "ipa": return verifyEmployerIntegration(identifier);
      case "irc": return checkTaxComplianceIntegration(identifier);
      case "employer": return verifyEmploymentIntegration(identifier);
      case "medical": return verifyMedicalCertificateIntegration(identifier);
      case "insurance": return verifyInsurancePolicyIntegration(identifier);
      case "bank": return verifyBankAccountIntegration(identifier);
    }
  },
  processPayment: processSandboxPaymentIntegration,
  sendNotification: sendSandboxNotificationIntegration,
};

function stopped(claimReference: string, steps: DemoStep[]): DemoScenarioResult {
  return {
    scenario: "worker_claim",
    status: "stopped",
    claimReference,
    steps,
    paymentTransactionReference: null,
  };
}

function value(data: Record<string, unknown>, key: string): string {
  return typeof data[key] === "string" ? data[key] as string : "";
}

export async function runPersistentWorkerClaimDemo(
  overrides: DemoScenarioOverrides = {},
  integrations: PersistentScenarioGateway = defaultGateway,
): Promise<DemoScenarioResult> {
  const claimReference = DEMO_CLAIM_REFERENCE;
  const steps: DemoStep[] = [];

  const registration = registerClaimProcessing({
    claimReference,
    workerName: `${DEMO_IDENTITY.firstName} ${DEMO_IDENTITY.surname}`,
    employerName: DEMO_EMPLOYER.legalName,
  });
  steps.push({
    key: "claim_registration",
    label: "Claims processing registration",
    status: registration.data.accepted ? "passed" : "failed",
    summary: registration.data.accepted
      ? `Claim ${claimReference} registered for assessment`
      : "Claim could not be registered",
    correlationId: registration.correlationId,
  });
  if (!registration.data.accepted) return stopped(claimReference, steps);

  const identity = await integrations.lookup("nid", overrides.nid ?? DEMO_IDENTITY.nid);
  const identityPassed = identity.data.matched === true;
  steps.push({
    key: "identity", label: "National identity verification",
    status: identityPassed ? "passed" : "failed",
    summary: identityPassed ? "Claimant identity verified" : "Claimant identity not found",
    correlationId: identity.correlationId,
  });
  if (!identityPassed) return stopped(claimReference, steps);

  const employer = await integrations.lookup("ipa", overrides.registrationNo ?? DEMO_EMPLOYER.registrationNo);
  const employerPassed = employer.data.active === true;
  steps.push({
    key: "employer_registry", label: "Employer registration verification",
    status: employerPassed ? "passed" : "failed",
    summary: employerPassed ? "Employer registration active" : "Employer registration not verified",
    correlationId: employer.correlationId,
  });
  if (!employerPassed) return stopped(claimReference, steps);

  const tax = await integrations.lookup("irc", overrides.tin ?? DEMO_TAXPAYER.tin);
  const taxPassed = tax.data.status === "COMPLIANT";
  steps.push({
    key: "tax_compliance", label: "IRC tax compliance",
    status: taxPassed ? "passed" : "failed",
    summary: taxPassed ? "Employer tax status compliant" : "Tax compliance not verified",
    correlationId: tax.correlationId,
  });
  if (!taxPassed) return stopped(claimReference, steps);

  const employment = await integrations.lookup("employer", overrides.employeeNo ?? DEMO_EMPLOYMENT.employeeNo);
  const employmentPassed = employment.data.employed === true;
  steps.push({
    key: "employment", label: "Employment and wage verification",
    status: employmentPassed ? "passed" : "failed",
    summary: employmentPassed ? "Employment and wage details verified" : "Employment not verified",
    correlationId: employment.correlationId,
  });
  if (!employmentPassed) return stopped(claimReference, steps);

  const medical = await integrations.lookup("medical", overrides.certificateNo ?? DEMO_MEDICAL_CERTIFICATE.certificateNo);
  const medicalPassed = medical.data.valid === true;
  steps.push({
    key: "medical", label: "Medical certificate verification",
    status: medicalPassed ? "passed" : "failed",
    summary: medicalPassed ? "Medical certificate valid" : "Medical certificate not verified",
    correlationId: medical.correlationId,
  });
  if (!medicalPassed) return stopped(claimReference, steps);

  const insurance = await integrations.lookup("insurance", overrides.policyNo ?? DEMO_INSURANCE_POLICY.policyNo);
  const insurancePassed = insurance.data.active === true;
  steps.push({
    key: "insurance", label: "Workers compensation insurance",
    status: insurancePassed ? "passed" : "failed",
    summary: insurancePassed ? "Employer insurance policy active" : "Insurance policy not verified",
    correlationId: insurance.correlationId,
  });
  if (!insurancePassed) return stopped(claimReference, steps);

  const bank = await integrations.lookup("bank", overrides.accountReference ?? DEMO_BANK_ACCOUNT.accountReference);
  const bankPassed = bank.data.verified === true;
  steps.push({
    key: "bank_account", label: "Bank account verification",
    status: bankPassed ? "passed" : "failed",
    summary: bankPassed ? "Claimant bank account verified" : "Bank account not verified",
    correlationId: bank.correlationId,
  });
  if (!bankPassed) return stopped(claimReference, steps);

  const reconciliation = validateIntegrationCoherence({
    nid: value(identity.data, "nid"),
    identityName: `${value(identity.data, "firstName")} ${value(identity.data, "surname")}`,
    employerRegistrationNo: value(employer.data, "registrationNo"),
    taxpayerRegistrationNo: value(tax.data, "registrationNo"),
    employmentNid: value(employment.data, "nid"),
    employmentEmployerRegistrationNo: value(employment.data, "employerRegistrationNo"),
    medicalPatientNid: value(medical.data, "patientNid"),
    insuranceEmployerRegistrationNo: value(insurance.data, "employerRegistrationNo"),
    bankAccountName: value(bank.data, "accountName"),
  });
  steps.push({
    key: "record_reconciliation", label: "Cross-agency record reconciliation",
    status: reconciliation.ok ? "passed" : "failed",
    summary: reconciliation.ok
      ? "Identity, employer, medical, insurance and banking records reconciled"
      : reconciliation.reason,
    correlationId: `RECON-${Date.now().toString(36).toUpperCase()}`,
  });
  if (!reconciliation.ok) return stopped(claimReference, steps);

  const determination = recordClaimDetermination({ claimReference, approvedAmountPgk: 18_450 });
  steps.push({
    key: "determination", label: "Claim determination",
    status: determination.data.accepted ? "passed" : "failed",
    summary: determination.data.accepted
      ? "Claim approved for K18,450.00 compensation"
      : "Claim determination could not be recorded",
    correlationId: determination.correlationId,
  });
  if (!determination.data.accepted) return stopped(claimReference, steps);

  const payment = await integrations.processPayment({
    idempotencyKey: `PAY-${claimReference}`,
    claimReference,
    accountReference: overrides.accountReference ?? DEMO_BANK_ACCOUNT.accountReference,
    amountPgk: 18_450,
  });
  const transactionReference = value(payment.data, "transactionReference");
  steps.push({
    key: "payment", label: "Simulated compensation payment", status: "passed",
    summary: `K18,450.00 simulated payment transaction generated as ${transactionReference}; no real funds moved`,
    correlationId: payment.correlationId,
  });

  const notification = await integrations.sendNotification({
    channel: "sms",
    recipient: "+67570000001",
    event: "PAYMENT_SIMULATED",
    message: `Demonstration payment transaction for ${claimReference} has been generated. No real funds moved.`,
    claimReference,
  });
  steps.push({
    key: "notification", label: "Claimant notification",
    status: notification.data.accepted === true ? "passed" : "failed",
    summary: notification.data.accepted === true
      ? "Synthetic SMS notification accepted for the demonstration outbox"
      : "Notification could not be recorded",
    correlationId: notification.correlationId,
  });

  return {
    scenario: "worker_claim",
    status: "completed",
    claimReference,
    steps,
    paymentTransactionReference: transactionReference,
  };
}
