export type IntegrationCoherenceInput = {
  nid: string;
  identityName: string;
  employerRegistrationNo: string;
  taxpayerRegistrationNo: string;
  employmentNid: string;
  employmentEmployerRegistrationNo: string;
  medicalPatientNid: string;
  insuranceEmployerRegistrationNo: string;
  bankAccountName: string;
};

export type IntegrationCoherenceResult =
  | { ok: true }
  | { ok: false; reason: string };

const normalized = (value: string) => value.trim().toUpperCase();

export function validateIntegrationCoherence(
  input: IntegrationCoherenceInput,
): IntegrationCoherenceResult {
  const nid = normalized(input.nid);
  const employer = normalized(input.employerRegistrationNo);

  if (normalized(input.employmentNid) !== nid) {
    return { ok: false, reason: "The employment identity does not match the verified national identity." };
  }
  if (normalized(input.medicalPatientNid) !== nid) {
    return { ok: false, reason: "The medical certificate identity does not match the verified national identity." };
  }
  if (normalized(input.taxpayerRegistrationNo) !== employer) {
    return { ok: false, reason: "The IRC taxpayer record does not match the verified employer." };
  }
  if (normalized(input.employmentEmployerRegistrationNo) !== employer) {
    return { ok: false, reason: "The employment record does not match the verified employer." };
  }
  if (normalized(input.insuranceEmployerRegistrationNo) !== employer) {
    return { ok: false, reason: "The insurance policy does not match the verified employer." };
  }
  if (normalized(input.bankAccountName) !== normalized(input.identityName)) {
    return { ok: false, reason: "The bank account holder does not match the verified worker." };
  }

  return { ok: true };
}
