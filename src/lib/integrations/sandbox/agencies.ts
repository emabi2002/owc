import {
  ADDITIONAL_BANK_ACCOUNTS,
  ADDITIONAL_EMPLOYERS,
  ADDITIONAL_EMPLOYMENTS,
  ADDITIONAL_IDENTITIES,
  ADDITIONAL_INSURANCE_POLICIES,
  ADDITIONAL_MEDICAL_CERTIFICATES,
  ADDITIONAL_TAXPAYERS,
} from "./additional-data";
import {
  DEMO_BANK_ACCOUNT,
  DEMO_EMPLOYER,
  DEMO_EMPLOYMENT,
  DEMO_IDENTITY,
  DEMO_INSURANCE_POLICY,
  DEMO_MEDICAL_CERTIFICATE,
  DEMO_TAXPAYER,
} from "./data";
import { makeSandboxEnvelope } from "./service";

export interface SimulatedPaymentTransaction {
  transactionReference: string;
  receiptReference: string;
  status: "SIMULATED";
  simulation: true;
  moneyMovement: false;
  currency: "PGK";
  generatedAt: string;
  claimReference: string;
  accountReference: string;
  bankName: string;
  accountName: string;
  maskedAccountNumber: string;
  amountPgk: number;
}

const payments = new Map<string, SimulatedPaymentTransaction>();
let paymentSequence = 0;

const identities = [DEMO_IDENTITY, ...ADDITIONAL_IDENTITIES];
const employers = [DEMO_EMPLOYER, ...ADDITIONAL_EMPLOYERS];
const taxpayers = [DEMO_TAXPAYER, ...ADDITIONAL_TAXPAYERS];
const employments = [DEMO_EMPLOYMENT, ...ADDITIONAL_EMPLOYMENTS];
const medicalCertificates = [
  DEMO_MEDICAL_CERTIFICATE,
  ...ADDITIONAL_MEDICAL_CERTIFICATES,
];
const insurancePolicies = [
  DEMO_INSURANCE_POLICY,
  ...ADDITIONAL_INSURANCE_POLICIES,
];
const bankAccounts = [DEMO_BANK_ACCOUNT, ...ADDITIONAL_BANK_ACCOUNTS];

const code = (value: string) => value.trim().toUpperCase();

export function verifyIdentity(nid: string) {
  const normalized = code(nid);
  const record = identities.find((item) => item.nid === normalized);
  const matched = Boolean(record);
  return makeSandboxEnvelope(
    "nid",
    "verify_identity",
    record
      ? {
          matched: true,
          nid: record.nid,
          firstName: record.firstName,
          surname: record.surname,
          dateOfBirth: record.dateOfBirth,
          province: record.province,
          identityStatus: record.identityStatus,
        }
      : { matched: false, nid: normalized },
    matched ? "success" : "not_found",
  );
}

export function verifyEmployer(registrationNo: string) {
  const normalized = code(registrationNo);
  const record = employers.find((item) => item.registrationNo === normalized);
  const active = record?.status === "ACTIVE";
  return makeSandboxEnvelope(
    "ipa",
    "verify_company",
    record && active
      ? {
          active: true,
          registrationNo: record.registrationNo,
          legalName: record.legalName,
          tradingName: record.tradingName,
          industry: record.industry,
          registeredAddress: record.registeredAddress,
        }
      : { active: false, registrationNo: normalized },
    active ? "success" : "not_found",
  );
}

export function checkTaxCompliance(tin: string) {
  const normalized = code(tin);
  const record = taxpayers.find((item) => item.tin === normalized);
  const matched = Boolean(record);
  return makeSandboxEnvelope(
    "irc",
    "check_compliance",
    record
      ? {
          found: true,
          tin: record.tin,
          taxpayerName: record.taxpayerName,
          registrationNo: record.registrationNo,
          status: record.status,
        }
      : { found: false, tin: normalized, status: "UNKNOWN" as const },
    matched ? "success" : "not_found",
  );
}

export function verifyEmployment(employeeNo: string) {
  const normalized = code(employeeNo);
  const record = employments.find((item) => item.employeeNo === normalized);
  const employed = record?.employmentStatus === "ACTIVE";
  return makeSandboxEnvelope(
    "employer",
    "verify_employment",
    record && employed
      ? {
          employed: true,
          employeeNo: record.employeeNo,
          nid: record.nid,
          employerRegistrationNo: record.employerRegistrationNo,
          employeeName: record.employeeName,
          position: record.position,
          workLocation: record.workLocation,
          fortnightlySalaryPgk: record.fortnightlySalaryPgk,
          employmentStatus: record.employmentStatus,
        }
      : { employed: false, employeeNo: normalized },
    employed ? "success" : "not_found",
  );
}

export function verifyMedicalCertificate(certificateNo: string) {
  const normalized = code(certificateNo);
  const record = medicalCertificates.find(
    (item) => item.certificateNo === normalized,
  );
  const valid = record?.status === "VALID";
  return makeSandboxEnvelope(
    "medical",
    "verify_certificate",
    record && valid
      ? {
          valid: true,
          certificateNo: record.certificateNo,
          patientNid: record.patientNid,
          provider: record.provider,
          practitioner: record.practitioner,
          injuryCategory: record.injuryCategory,
          incapacityDays: record.incapacityDays,
          issuedAt: record.issuedAt,
        }
      : { valid: false, certificateNo: normalized },
    valid ? "success" : "not_found",
  );
}

export function verifyInsurancePolicy(policyNo: string) {
  const normalized = code(policyNo);
  const record = insurancePolicies.find((item) => item.policyNo === normalized);
  const active = record?.status === "ACTIVE";
  return makeSandboxEnvelope(
    "insurance",
    "verify_policy",
    record && active
      ? {
          active: true,
          policyNo: record.policyNo,
          employerRegistrationNo: record.employerRegistrationNo,
          insurer: record.insurer,
          coverType: record.coverType,
          expiryDate: record.expiryDate,
        }
      : { active: false, policyNo: normalized },
    active ? "success" : "not_found",
  );
}

export function verifyBankAccount(accountReference: string) {
  const normalized = code(accountReference);
  const record = bankAccounts.find(
    (item) => item.accountReference === normalized,
  );
  const verified = record?.status === "VERIFIED";
  return makeSandboxEnvelope(
    "bank",
    "verify_account",
    record && verified
      ? {
          verified: true,
          accountReference: record.accountReference,
          bankName: record.bankName,
          accountName: record.accountName,
          maskedAccountNumber: record.maskedAccountNumber,
        }
      : { verified: false, accountReference: normalized },
    verified ? "success" : "not_found",
  );
}

export interface SandboxPaymentInput {
  idempotencyKey: string;
  claimReference: string;
  accountReference: string;
  amountPgk: number;
}

export function processSandboxPayment(input: SandboxPaymentInput) {
  const existing = payments.get(input.idempotencyKey);
  if (existing) {
    return makeSandboxEnvelope("bank", "process_payment", {
      ...existing,
      duplicateRequest: true,
    });
  }

  const normalizedAccountReference = code(input.accountReference);
  const account = bankAccounts.find(
    (item) =>
      item.accountReference === normalizedAccountReference &&
      item.status === "VERIFIED",
  );
  if (!account) {
    throw new Error("Simulated payment requires a verified demonstration bank account");
  }

  paymentSequence += 1;
  const generatedAt = new Date().toISOString();
  const year = new Date(generatedAt).getUTCFullYear();
  const sequence = String(paymentSequence).padStart(8, "0");
  const transaction: SimulatedPaymentTransaction = {
    transactionReference: `SIM-PAY-${year}-${sequence}`,
    receiptReference: `SIM-RCPT-${year}-${sequence}`,
    status: "SIMULATED",
    simulation: true,
    moneyMovement: false,
    currency: "PGK",
    generatedAt,
    claimReference: input.claimReference,
    accountReference: account.accountReference,
    bankName: account.bankName,
    accountName: account.accountName,
    maskedAccountNumber: account.maskedAccountNumber,
    amountPgk: input.amountPgk,
  };
  payments.set(input.idempotencyKey, transaction);

  return makeSandboxEnvelope("bank", "process_payment", {
    ...transaction,
    duplicateRequest: false,
  });
}

export function listSandboxPayments(): readonly SimulatedPaymentTransaction[] {
  return [...payments.values()].map((payment) => ({ ...payment }));
}

export function resetSandboxPayments(): void {
  payments.clear();
  paymentSequence = 0;
}

export function sendSandboxNotification(input: {
  channel: "email" | "sms" | "in_app";
  recipient: string;
  event: string;
  message: string;
}) {
  return makeSandboxEnvelope("notifications", "send_notification", {
    accepted: true,
    deliveryReference: `MSG-${Date.now().toString(36).toUpperCase()}`,
    ...input,
  });
}
