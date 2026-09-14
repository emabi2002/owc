export type DemonstrationClaimStatus =
  | "RECEIVED"
  | "DOCUMENTS_REQUIRED"
  | "ASSESSMENT"
  | "APPROVED"
  | "DECLINED"
  | "PAYMENT_SCHEDULED"
  | "SIMULATED_PAYMENT"
  | "CLOSED";

export type DemonstrationDecision = "PENDING" | "APPROVED" | "DECLINED";
export type DemonstrationNotificationStatus = "QUEUED" | "SENT" | "FAILED";

export type DemonstrationClaim = {
  reference: string;
  workerName: string;
  employerName: string;
  province: string;
  industry: string;
  occupation: string;
  injuryType: string;
  receivedAt: string;
  status: DemonstrationClaimStatus;
  assessmentOutstanding: boolean;
  decision: DemonstrationDecision;
  simulatedPaymentAmountPgk: number | null;
  turnaroundDays: number;
  notificationStatus: DemonstrationNotificationStatus;
  synthetic: true;
};

const claim = (
  input: Omit<DemonstrationClaim, "synthetic">,
): DemonstrationClaim => ({ ...input, synthetic: true });

/**
 * Stable presentation dataset. These are synthetic demonstration records only;
 * they are not derived from real OWC claimant, employer, medical or banking data.
 */
export const DEMONSTRATION_CLAIMS: readonly DemonstrationClaim[] = [
  claim({ reference: "OWC-2026-005112", workerName: "Mara Kila", employerName: "Pacific Engineering Ltd", province: "National Capital District", industry: "Engineering Services", occupation: "Heavy Equipment Operator", injuryType: "Workplace limb injury", receivedAt: "2026-09-10T08:15:00.000Z", status: "SIMULATED_PAYMENT", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 18450, turnaroundDays: 4, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005113", workerName: "Thomas Wali", employerName: "Highlands Civil Works Ltd", province: "Western Highlands", industry: "Construction", occupation: "Carpenter", injuryType: "Hand injury", receivedAt: "2026-09-09T09:00:00.000Z", status: "DOCUMENTS_REQUIRED", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 5, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005114", workerName: "Grace Nalo", employerName: "Coastal Fisheries PNG Ltd", province: "Morobe", industry: "Fisheries", occupation: "Processing Supervisor", injuryType: "Slip and fall", receivedAt: "2026-09-08T07:30:00.000Z", status: "ASSESSMENT", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 6, notificationStatus: "QUEUED" }),
  claim({ reference: "OWC-2026-005115", workerName: "Peter Kua", employerName: "Sepik Agro Services Ltd", province: "East Sepik", industry: "Agriculture", occupation: "Machine Operator", injuryType: "Back strain", receivedAt: "2026-09-07T10:20:00.000Z", status: "APPROVED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: null, turnaroundDays: 7, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005116", workerName: "Lina Aro", employerName: "Island Retail Holdings Ltd", province: "East New Britain", industry: "Retail", occupation: "Store Supervisor", injuryType: "Shoulder injury", receivedAt: "2026-09-06T11:45:00.000Z", status: "PAYMENT_SCHEDULED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 9200, turnaroundDays: 8, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005117", workerName: "Daniel Poko", employerName: "Papua Logistics Ltd", province: "National Capital District", industry: "Transport & Logistics", occupation: "Truck Driver", injuryType: "Road transport injury", receivedAt: "2026-09-05T12:10:00.000Z", status: "CLOSED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 12600, turnaroundDays: 8, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005118", workerName: "Mary Kera", employerName: "Madang Marine Services Ltd", province: "Madang", industry: "Marine Services", occupation: "Stores Clerk", injuryType: "Foot injury", receivedAt: "2026-09-04T08:40:00.000Z", status: "DECLINED", assessmentOutstanding: false, decision: "DECLINED", simulatedPaymentAmountPgk: null, turnaroundDays: 9, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005119", workerName: "Joseph Tama", employerName: "Hela Energy Support Ltd", province: "Hela", industry: "Energy Services", occupation: "Field Technician", injuryType: "Burn injury", receivedAt: "2026-09-14T00:20:00.000Z", status: "RECEIVED", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 0, notificationStatus: "QUEUED" }),
  claim({ reference: "OWC-2026-005120", workerName: "Ruth Mape", employerName: "New Ireland Hospitality Ltd", province: "New Ireland", industry: "Hospitality", occupation: "Kitchen Supervisor", injuryType: "Cut injury", receivedAt: "2026-09-13T05:30:00.000Z", status: "RECEIVED", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 1, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005121", workerName: "Michael Kora", employerName: "Pacific Engineering Ltd", province: "National Capital District", industry: "Engineering Services", occupation: "Electrical Technician", injuryType: "Electrical injury", receivedAt: "2026-09-12T06:25:00.000Z", status: "DOCUMENTS_REQUIRED", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 2, notificationStatus: "FAILED" }),
  claim({ reference: "OWC-2026-005122", workerName: "Anna Wama", employerName: "Southern Health Supplies Ltd", province: "Central", industry: "Health Supplies", occupation: "Warehouse Officer", injuryType: "Knee injury", receivedAt: "2026-09-11T03:10:00.000Z", status: "ASSESSMENT", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 3, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005123", workerName: "Simon Nema", employerName: "Gulf Industrial Services Ltd", province: "Gulf", industry: "Industrial Services", occupation: "Welder", injuryType: "Eye injury", receivedAt: "2026-09-03T02:30:00.000Z", status: "APPROVED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: null, turnaroundDays: 10, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005124", workerName: "Lucy Aila", employerName: "Bougainville Trade Services Ltd", province: "Autonomous Region of Bougainville", industry: "Trade Services", occupation: "Accounts Clerk", injuryType: "Wrist injury", receivedAt: "2026-09-02T04:00:00.000Z", status: "PAYMENT_SCHEDULED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 7400, turnaroundDays: 11, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005125", workerName: "Isaac Tore", employerName: "Simbu Highlands Produce Ltd", province: "Chimbu", industry: "Agriculture", occupation: "Farm Supervisor", injuryType: "Leg injury", receivedAt: "2026-09-01T01:50:00.000Z", status: "SIMULATED_PAYMENT", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 15300, turnaroundDays: 11, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005126", workerName: "Rebecca Goma", employerName: "Milne Bay Tourism Ltd", province: "Milne Bay", industry: "Tourism", occupation: "Guest Services Officer", injuryType: "Ankle injury", receivedAt: "2026-08-31T07:15:00.000Z", status: "CLOSED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 6800, turnaroundDays: 12, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005127", workerName: "Paul Ningi", employerName: "Enga Mining Support Ltd", province: "Enga", industry: "Mining Services", occupation: "Plant Fitter", injuryType: "Crush injury", receivedAt: "2026-08-30T09:45:00.000Z", status: "DECLINED", assessmentOutstanding: false, decision: "DECLINED", simulatedPaymentAmountPgk: null, turnaroundDays: 13, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005128", workerName: "Helen Baki", employerName: "West New Britain Plantations Ltd", province: "West New Britain", industry: "Agriculture", occupation: "Field Officer", injuryType: "Heat illness", receivedAt: "2026-09-13T12:05:00.000Z", status: "ASSESSMENT", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 1, notificationStatus: "QUEUED" }),
  claim({ reference: "OWC-2026-005129", workerName: "Andrew Wesa", employerName: "Oro Forestry Services Ltd", province: "Oro", industry: "Forestry", occupation: "Chainsaw Operator", injuryType: "Laceration", receivedAt: "2026-09-12T11:35:00.000Z", status: "DOCUMENTS_REQUIRED", assessmentOutstanding: true, decision: "PENDING", simulatedPaymentAmountPgk: null, turnaroundDays: 2, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005130", workerName: "Monica Kaki", employerName: "Manus Port Services Ltd", province: "Manus", industry: "Port Services", occupation: "Cargo Officer", injuryType: "Back injury", receivedAt: "2026-09-10T13:20:00.000Z", status: "APPROVED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: null, turnaroundDays: 4, notificationStatus: "SENT" }),
  claim({ reference: "OWC-2026-005131", workerName: "George Pari", employerName: "Western River Transport Ltd", province: "Western", industry: "Transport & Logistics", occupation: "Boat Operator", injuryType: "Shoulder strain", receivedAt: "2026-08-29T10:05:00.000Z", status: "CLOSED", assessmentOutstanding: false, decision: "APPROVED", simulatedPaymentAmountPgk: 10800, turnaroundDays: 14, notificationStatus: "SENT" }),
] as const;
