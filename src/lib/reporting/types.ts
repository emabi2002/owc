export type ManagementReportKind =
  | "executive"
  | "province"
  | "employer"
  | "aging"
  | "category"
  | "turnaround"
  | "payments";

export type ManagementReportRequest = {
  report: ManagementReportKind;
  from?: string;
  to?: string;
  province?: string;
  employer?: string;
  status?: string;
};

export type ManagementReportingRow = {
  reference: string;
  workerName: string;
  employerName: string;
  province: string;
  district?: string | null;
  industry?: string | null;
  occupation?: string | null;
  injuryType?: string | null;
  receivedAt: string;
  status: string;
  decision?: string | null;
  compensationAmountPgk?: number | null;
  turnaroundDays?: number | null;
  notificationStatus?: string | null;
  paymentStatus?: string | null;
  assignedOfficer?: string | null;
  synthetic?: boolean;
};

export type ManagementReportGroup = {
  key: string;
  label: string;
  count: number;
  amountPgk?: number;
  averageTurnaroundDays?: number;
};

export type ManagementReportTotals = {
  totalClaims: number;
  approvedClaims: number;
  declinedClaims: number;
  pendingClaims: number;
  closedClaims: number;
  averageTurnaroundDays: number;
  maximumTurnaroundDays: number;
  illustrativePaymentAmountPgk: number;
};

export type ManagementReportResult = {
  report: ManagementReportKind;
  title: string;
  request: ManagementReportRequest;
  recordCount: number;
  totals: ManagementReportTotals;
  statusCounts: Record<string, number>;
  groups: ManagementReportGroup[];
  rows: ManagementReportingRow[];
  syntheticData: boolean;
  disclosure: string;
};
