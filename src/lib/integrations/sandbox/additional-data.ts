export const ADDITIONAL_IDENTITIES = [
  {
    nid: "NID-00010002",
    firstName: "Lina",
    surname: "Tovue",
    dateOfBirth: "1991-08-07",
    province: "Morobe Province",
    identityStatus: "VERIFIED",
  },
] as const;

export const ADDITIONAL_EMPLOYERS = [
  {
    registrationNo: "IPA-2018-2044",
    legalName: "Highlands Construction Services Ltd",
    tradingName: "Highlands Construction",
    status: "ACTIVE",
    industry: "Civil Construction",
    registeredAddress: "Lae, Morobe Province",
  },
] as const;

export const ADDITIONAL_TAXPAYERS = [
  {
    tin: "TIN-90010002",
    registrationNo: "IPA-2018-2044",
    taxpayerName: "Highlands Construction Services Ltd",
    status: "COMPLIANT",
  },
] as const;

export const ADDITIONAL_EMPLOYMENTS = [
  {
    employeeNo: "EMP-0001002",
    nid: "NID-00010002",
    employerRegistrationNo: "IPA-2018-2044",
    employeeName: "Lina Tovue",
    position: "Site Administration Officer",
    workLocation: "Lae Project Office",
    fortnightlySalaryPgk: 1850,
    employmentStatus: "ACTIVE",
  },
] as const;

export const ADDITIONAL_MEDICAL_CERTIFICATES = [
  {
    certificateNo: "MED-2026-00452",
    patientNid: "NID-00010002",
    provider: "Morobe Occupational Health Clinic",
    practitioner: "Medical Officer 02",
    injuryCategory: "Workplace back injury",
    incapacityDays: 10,
    issuedAt: "2026-09-08",
    status: "VALID",
  },
] as const;

export const ADDITIONAL_INSURANCE_POLICIES = [
  {
    policyNo: "WC-POL-2026-01903",
    employerRegistrationNo: "IPA-2018-2044",
    insurer: "Employer Assurance Service",
    coverType: "Workers Compensation",
    expiryDate: "2027-03-31",
    status: "ACTIVE",
  },
] as const;

export const ADDITIONAL_BANK_ACCOUNTS = [
  {
    accountReference: "BANK-ACC-3921",
    bankName: "Banking Service 02",
    accountName: "Lina Tovue",
    maskedAccountNumber: "****3921",
    status: "VERIFIED",
  },
] as const;
