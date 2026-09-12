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

const payments = new Map<string, { transactionReference: string; status: "PROCESSED" }>();

export function verifyIdentity(nid: string) {
  const matched = nid.trim().toUpperCase() === DEMO_IDENTITY.nid;
  return makeSandboxEnvelope(
    "nid",
    "verify_identity",
    matched
      ? {
          matched: true,
          nid: DEMO_IDENTITY.nid,
          firstName: DEMO_IDENTITY.firstName,
          surname: DEMO_IDENTITY.surname,
          dateOfBirth: DEMO_IDENTITY.dateOfBirth,
          province: DEMO_IDENTITY.province,
          identityStatus: DEMO_IDENTITY.identityStatus,
        }
      : { matched: false, nid: nid.trim().toUpperCase() },
    matched ? "success" : "not_found",
  );
}

export function verifyEmployer(registrationNo: string) {
  const active = registrationNo.trim().toUpperCase() === DEMO_EMPLOYER.registrationNo;
  return makeSandboxEnvelope(
    "ipa",
    "verify_company",
    active
      ? {
          active: true,
          registrationNo: DEMO_EMPLOYER.registrationNo,
          legalName: DEMO_EMPLOYER.legalName,
          tradingName: DEMO_EMPLOYER.tradingName,
          industry: DEMO_EMPLOYER.industry,
          registeredAddress: DEMO_EMPLOYER.registeredAddress,
        }
      : { active: false, registrationNo: registrationNo.trim().toUpperCase() },
    active ? "success" : "not_found",
  );
}

export function checkTaxCompliance(tin: string) {
  const matched = tin.trim().toUpperCase() === DEMO_TAXPAYER.tin;
  return makeSandboxEnvelope(
    "irc",
    "check_compliance",
    matched
      ? {
          found: true,
          tin: DEMO_TAXPAYER.tin,
          taxpayerName: DEMO_TAXPAYER.taxpayerName,
          registrationNo: DEMO_TAXPAYER.registrationNo,
          status: DEMO_TAXPAYER.status,
        }
      : { found: false, tin: tin.trim().toUpperCase(), status: "UNKNOWN" as const },
    matched ? "success" : "not_found",
  );
}

export function verifyEmployment(employeeNo: string) {
  const employed = employeeNo.trim().toUpperCase() === DEMO_EMPLOYMENT.employeeNo;
  return makeSandboxEnvelope(
    "employer",
    "verify_employment",
    employed
      ? {
          employed: true,
          employeeNo: DEMO_EMPLOYMENT.employeeNo,
          nid: DEMO_EMPLOYMENT.nid,
          employerRegistrationNo: DEMO_EMPLOYMENT.employerRegistrationNo,
          employeeName: DEMO_EMPLOYMENT.employeeName,
          position: DEMO_EMPLOYMENT.position,
          workLocation: DEMO_EMPLOYMENT.workLocation,
          fortnightlySalaryPgk: DEMO_EMPLOYMENT.fortnightlySalaryPgk,
          employmentStatus: DEMO_EMPLOYMENT.employmentStatus,
        }
      : { employed: false, employeeNo: employeeNo.trim().toUpperCase() },
    employed ? "success" : "not_found",
  );
}

export function verifyMedicalCertificate(certificateNo: string) {
  const valid = certificateNo.trim().toUpperCase() === DEMO_MEDICAL_CERTIFICATE.certificateNo;
  return makeSandboxEnvelope(
    "medical",
    "verify_certificate",
    valid
      ? {
          valid: true,
          certificateNo: DEMO_MEDICAL_CERTIFICATE.certificateNo,
          patientNid: DEMO_MEDICAL_CERTIFICATE.patientNid,
          provider: DEMO_MEDICAL_CERTIFICATE.provider,
          practitioner: DEMO_MEDICAL_CERTIFICATE.practitioner,
          injuryCategory: DEMO_MEDICAL_CERTIFICATE.injuryCategory,
          incapacityDays: DEMO_MEDICAL_CERTIFICATE.incapacityDays,
          issuedAt: DEMO_MEDICAL_CERTIFICATE.issuedAt,
        }
      : { valid: false, certificateNo: certificateNo.trim().toUpperCase() },
    valid ? "success" : "not_found",
  );
}

export function verifyInsurancePolicy(policyNo: string) {
  const active = policyNo.trim().toUpperCase() === DEMO_INSURANCE_POLICY.policyNo;
  return makeSandboxEnvelope(
    "insurance",
    "verify_policy",
    active
      ? {
          active: true,
          policyNo: DEMO_INSURANCE_POLICY.policyNo,
          employerRegistrationNo: DEMO_INSURANCE_POLICY.employerRegistrationNo,
          insurer: DEMO_INSURANCE_POLICY.insurer,
          coverType: DEMO_INSURANCE_POLICY.coverType,
          expiryDate: DEMO_INSURANCE_POLICY.expiryDate,
        }
      : { active: false, policyNo: policyNo.trim().toUpperCase() },
    active ? "success" : "not_found",
  );
}

export function verifyBankAccount(accountReference: string) {
  const verified = accountReference.trim().toUpperCase() === DEMO_BANK_ACCOUNT.accountReference;
  return makeSandboxEnvelope(
    "bank",
    "verify_account",
    verified
      ? {
          verified: true,
          accountReference: DEMO_BANK_ACCOUNT.accountReference,
          bankName: DEMO_BANK_ACCOUNT.bankName,
          accountName: DEMO_BANK_ACCOUNT.accountName,
          maskedAccountNumber: DEMO_BANK_ACCOUNT.maskedAccountNumber,
        }
      : { verified: false, accountReference: accountReference.trim().toUpperCase() },
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
      claimReference: input.claimReference,
      accountReference: input.accountReference,
      amountPgk: input.amountPgk,
      duplicateRequest: true,
    });
  }

  const transactionReference = `TXN-2026-${String(payments.size + 1).padStart(8, "0")}`;
  const result = { transactionReference, status: "PROCESSED" as const };
  payments.set(input.idempotencyKey, result);

  return makeSandboxEnvelope("bank", "process_payment", {
    ...result,
    claimReference: input.claimReference,
    accountReference: input.accountReference,
    amountPgk: input.amountPgk,
    duplicateRequest: false,
  });
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
