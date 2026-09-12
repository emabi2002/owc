export const DEMO_IDENTITY = {
  nid: "NID-DEMO-0001",
  firstName: "Mara",
  surname: "Kila",
  dateOfBirth: "1987-04-18",
  province: "National Capital District",
  identityStatus: "VERIFIED",
} as const;

export const DEMO_EMPLOYER = {
  registrationNo: "IPA-DEMO-1001",
  legalName: "Pacific Engineering Demo Ltd",
  tradingName: "Pacific Engineering Demo",
  status: "ACTIVE",
  industry: "Engineering Services",
  registeredAddress: "Demo Industrial Estate, Port Moresby",
} as const;

export const DEMO_TAXPAYER = {
  tin: "TIN-DEMO-9001",
  registrationNo: DEMO_EMPLOYER.registrationNo,
  taxpayerName: DEMO_EMPLOYER.legalName,
  status: "COMPLIANT",
} as const;

export const DEMO_EMPLOYMENT = {
  employeeNo: "EMP-DEMO-001",
  nid: DEMO_IDENTITY.nid,
  employerRegistrationNo: DEMO_EMPLOYER.registrationNo,
  employeeName: `${DEMO_IDENTITY.firstName} ${DEMO_IDENTITY.surname}`,
  position: "Heavy Equipment Operator",
  workLocation: "Port Moresby Demo Site",
  fortnightlySalaryPgk: 2400,
  employmentStatus: "ACTIVE",
} as const;

export const DEMO_MEDICAL_CERTIFICATE = {
  certificateNo: "MED-DEMO-001",
  patientNid: DEMO_IDENTITY.nid,
  provider: "OWC Demo Medical Provider",
  practitioner: "Dr Demo Aro",
  injuryCategory: "Workplace limb injury",
  incapacityDays: 14,
  issuedAt: "2026-09-10",
  status: "VALID",
} as const;

export const DEMO_INSURANCE_POLICY = {
  policyNo: "POL-DEMO-001",
  employerRegistrationNo: DEMO_EMPLOYER.registrationNo,
  insurer: "PNG Workers Insurance Demo",
  coverType: "Workers Compensation",
  expiryDate: "2026-12-31",
  status: "ACTIVE",
} as const;

export const DEMO_BANK_ACCOUNT = {
  accountReference: "BANK-DEMO-001",
  bankName: "PNG Demo Commercial Bank",
  accountName: `${DEMO_IDENTITY.firstName} ${DEMO_IDENTITY.surname}`,
  maskedAccountNumber: "****7842",
  status: "VERIFIED",
} as const;

export const DEMO_CLAIM_REFERENCE = "OWC-DEMO-CLAIM-0001";
