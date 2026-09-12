export const DEMO_IDENTITY = {
  nid: "NID-00010001",
  firstName: "Mara",
  surname: "Kila",
  dateOfBirth: "1987-04-18",
  province: "National Capital District",
  identityStatus: "VERIFIED",
} as const;

export const DEMO_EMPLOYER = {
  registrationNo: "IPA-2020-1001",
  legalName: "Pacific Engineering Ltd",
  tradingName: "Pacific Engineering",
  status: "ACTIVE",
  industry: "Engineering Services",
  registeredAddress: "Waigani Industrial Area, Port Moresby",
} as const;

export const DEMO_TAXPAYER = {
  tin: "TIN-90010001",
  registrationNo: DEMO_EMPLOYER.registrationNo,
  taxpayerName: DEMO_EMPLOYER.legalName,
  status: "COMPLIANT",
} as const;

export const DEMO_EMPLOYMENT = {
  employeeNo: "EMP-0001001",
  nid: DEMO_IDENTITY.nid,
  employerRegistrationNo: DEMO_EMPLOYER.registrationNo,
  employeeName: `${DEMO_IDENTITY.firstName} ${DEMO_IDENTITY.surname}`,
  position: "Heavy Equipment Operator",
  workLocation: "Port Moresby Operations Site",
  fortnightlySalaryPgk: 2400,
  employmentStatus: "ACTIVE",
} as const;

export const DEMO_MEDICAL_CERTIFICATE = {
  certificateNo: "MED-2026-00451",
  patientNid: DEMO_IDENTITY.nid,
  provider: "National Workplace Medical Centre",
  practitioner: "Dr Aro Kila",
  injuryCategory: "Workplace limb injury",
  incapacityDays: 14,
  issuedAt: "2026-09-10",
  status: "VALID",
} as const;

export const DEMO_INSURANCE_POLICY = {
  policyNo: "WC-POL-2026-01872",
  employerRegistrationNo: DEMO_EMPLOYER.registrationNo,
  insurer: "Workers Mutual Insurance Ltd",
  coverType: "Workers Compensation",
  expiryDate: "2026-12-31",
  status: "ACTIVE",
} as const;

export const DEMO_BANK_ACCOUNT = {
  accountReference: "BANK-ACC-7842",
  bankName: "National Commercial Bank",
  accountName: `${DEMO_IDENTITY.firstName} ${DEMO_IDENTITY.surname}`,
  maskedAccountNumber: "****7842",
  status: "VERIFIED",
} as const;

export const DEMO_CLAIM_REFERENCE = "OWC-2026-005112";
