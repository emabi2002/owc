import type {
  CppsEmployerCheck,
  CppsEnquiryInput,
  CppsEnquiryResult,
  CppsInjuryReportInput,
  CppsInjuryReportResult,
  CppsLodgeInput,
} from "../types";

export type ReferenceCppsState =
  | "received"
  | "registration_review"
  | "medical_review"
  | "assessment"
  | "approved"
  | "rejected"
  | "payment_scheduled"
  | "paid"
  | "closed";

export type ReferenceCppsEvent = {
  at: string;
  fromState: ReferenceCppsState | null;
  toState: ReferenceCppsState;
  event: "registered" | "transition" | "assessment" | "payment";
};

export type ReferenceCppsAssessment = {
  weeklyWage: number;
  assumedWeeks: number;
  amount: number;
  basis: string;
  assessedAt: string;
};

export type ReferenceCppsPayment = {
  reference: string;
  recordedAt: string;
  realFundsMoved: false;
};

export type ReferenceCppsClaim = {
  source: "reference";
  reference: string;
  receivedAt: string;
  state: ReferenceCppsState;
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
  documentCount: number;
  assessment?: ReferenceCppsAssessment;
  payment?: ReferenceCppsPayment;
  events: ReferenceCppsEvent[];
};

export type ReferenceCppsServiceOptions = {
  now?: () => Date;
};

export type ReferenceCppsService = {
  registerClaim(input: CppsLodgeInput): ReferenceCppsClaim;
  getClaim(reference: string): ReferenceCppsClaim | undefined;
  transitionClaim(reference: string, toState: ReferenceCppsState): ReferenceCppsClaim;
  assessClaim(reference: string, assumedWeeks: number): ReferenceCppsClaim;
  recordSyntheticPayment(reference: string): ReferenceCppsClaim;
  verifyEmployer(query: string): CppsEmployerCheck;
  receiveInjuryReport(input: CppsInjuryReportInput): CppsInjuryReportResult;
  receiveEnquiry(input: CppsEnquiryInput): CppsEnquiryResult;
};
