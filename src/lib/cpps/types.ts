/**
 * CPPS (Compensation Processing & Payment System) integration types.
 * These model the request/response contracts for the OWC claims back-end.
 */

export type CppsClaimStep = {
  label: string;
  done: boolean;
  date?: string;
};

export type CppsClaimStatus = {
  reference: string;
  worker: string;
  employer: string;
  injuryDate: string;
  lodged: string;
  type: string;
  status: string;
  steps: CppsClaimStep[];
};

export type CppsEmployerCheck = {
  registered: boolean;
  name?: string;
  registrationNo?: string;
  policyExpiry?: string;
  status?: "Compliant" | "Lapsed" | "Pending" | "Unknown";
};

export type CppsLodgeInput = {
  workerName: string;
  workerPhone?: string;
  workerEmail?: string;
  employerName: string;
  province?: string;
  occupation?: string;
  weeklyWage?: string;
  injuryDate: string;
  injuryType?: string;
  description: string;
  documentCount?: number;
};

export type CppsLodgeResult = {
  reference: string;
  receivedAt: string;
};

export type CppsInjuryReportInput = {
  employerName: string;
  employerContact?: string;
  workerName: string;
  injuryDate: string;
  injuryType?: string;
  description: string;
};

export type CppsInjuryReportResult = {
  reference: string;
  receivedAt: string;
};

export type CppsEnquiryInput = {
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject?: string;
  message: string;
};

export type CppsEnquiryResult = {
  reference: string;
  receivedAt: string;
};

/** Discriminated result so callers can distinguish live from reference CPPS. */
export type CppsResult<T> =
  | { ok: true; data: T; source: "cpps" | "reference" }
  | { ok: false; error: string; source: "cpps" | "reference" };
