import type {
  CppsEnquiryInput,
  CppsInjuryReportInput,
  CppsLodgeInput,
} from "../types";
import { createReferenceCppsStore } from "./store";
import type {
  ReferenceCppsClaim,
  ReferenceCppsService,
  ReferenceCppsServiceOptions,
  ReferenceCppsState,
} from "./types";

const ALLOWED_TRANSITIONS: Record<ReferenceCppsState, readonly ReferenceCppsState[]> = {
  received: ["registration_review"],
  registration_review: ["medical_review", "rejected"],
  medical_review: ["assessment", "rejected"],
  assessment: ["approved", "rejected"],
  approved: ["payment_scheduled"],
  rejected: ["closed"],
  payment_scheduled: ["paid"],
  paid: ["closed"],
  closed: [],
};

const REFERENCE_EMPLOYER = {
  registered: true as const,
  name: "Pacific Engineering Demo Ltd",
  registrationNo: "CPPS-EMP-REF-0001",
  policyExpiry: "2026-12-31",
  status: "Compliant" as const,
};

export function createReferenceCppsService(
  options: ReferenceCppsServiceOptions = {},
): ReferenceCppsService {
  const now = options.now ?? (() => new Date());
  const store = createReferenceCppsStore();
  let claimSequence = 0;
  let injurySequence = 0;
  let enquirySequence = 0;

  const requireClaim = (reference: string) => {
    const claim = store.get(reference);
    if (!claim) throw new Error(`Reference CPPS claim not found: ${reference}`);
    return claim;
  };

  const nextReference = () => {
    claimSequence += 1;
    const year = now().getUTCFullYear();
    return `CPPS-REF-${year}-${String(claimSequence).padStart(6, "0")}`;
  };

  const nextReceiptReference = (prefix: "INJ" | "ENQ") => {
    const year = now().getUTCFullYear();
    if (prefix === "INJ") {
      injurySequence += 1;
      return `INJ-REF-${year}-${String(injurySequence).padStart(6, "0")}`;
    }
    enquirySequence += 1;
    return `ENQ-REF-${year}-${String(enquirySequence).padStart(6, "0")}`;
  };

  const transitionClaim = (reference: string, toState: ReferenceCppsState) => {
    const claim = requireClaim(reference);
    const allowed = ALLOWED_TRANSITIONS[claim.state];
    if (!allowed.includes(toState)) {
      throw new Error(`Invalid CPPS transition: ${claim.state} -> ${toState}`);
    }

    const at = now().toISOString();
    const next: ReferenceCppsClaim = {
      ...claim,
      state: toState,
      events: [
        ...claim.events,
        { at, fromState: claim.state, toState, event: "transition" },
      ],
    };
    store.save(next);
    return requireClaim(reference);
  };

  return {
    registerClaim(input: CppsLodgeInput) {
      const at = now().toISOString();
      const reference = nextReference();
      const claim: ReferenceCppsClaim = {
        source: "reference",
        reference,
        receivedAt: at,
        state: "received",
        workerName: input.workerName,
        workerPhone: input.workerPhone,
        workerEmail: input.workerEmail,
        employerName: input.employerName,
        province: input.province,
        occupation: input.occupation,
        weeklyWage: input.weeklyWage,
        injuryDate: input.injuryDate,
        injuryType: input.injuryType,
        description: input.description,
        documentCount: input.documentCount ?? 0,
        events: [{ at, fromState: null, toState: "received", event: "registered" }],
      };
      store.save(claim);
      return requireClaim(reference);
    },

    getClaim(reference) {
      return store.get(reference);
    },

    transitionClaim,

    assessClaim(reference, assumedWeeks) {
      const claim = requireClaim(reference);
      if (claim.state !== "assessment") {
        throw new Error(`Reference CPPS assessment requires assessment state, received ${claim.state}`);
      }
      if (!Number.isInteger(assumedWeeks) || assumedWeeks <= 0) {
        throw new Error("Reference CPPS assumed weeks must be a positive integer");
      }

      const weeklyWage = Number(claim.weeklyWage ?? 0);
      if (!Number.isFinite(weeklyWage) || weeklyWage <= 0) {
        throw new Error("Reference CPPS assessment requires a positive weekly wage");
      }

      const assessedAt = now().toISOString();
      const next: ReferenceCppsClaim = {
        ...claim,
        assessment: {
          weeklyWage,
          assumedWeeks,
          amount: Math.round(weeklyWage * assumedWeeks * 100) / 100,
          basis:
            "REFERENCE ASSUMPTION ONLY: weekly wage multiplied by assumed compensable weeks; not a statutory entitlement rule.",
          assessedAt,
        },
        events: [
          ...claim.events,
          {
            at: assessedAt,
            fromState: claim.state,
            toState: claim.state,
            event: "assessment",
          },
        ],
      };
      store.save(next);
      return requireClaim(reference);
    },

    recordSyntheticPayment(reference) {
      const claim = requireClaim(reference);
      if (claim.state === "paid" && claim.payment) return claim;
      if (claim.state !== "payment_scheduled") {
        throw new Error(`Reference CPPS payment requires payment_scheduled state, received ${claim.state}`);
      }

      const recordedAt = now().toISOString();
      const paymentReference = `PAY-${claim.reference}`;
      const paid: ReferenceCppsClaim = {
        ...claim,
        state: "paid",
        payment: {
          reference: paymentReference,
          recordedAt,
          realFundsMoved: false,
        },
        events: [
          ...claim.events,
          {
            at: recordedAt,
            fromState: "payment_scheduled",
            toState: "paid",
            event: "payment",
          },
        ],
      };
      store.save(paid);
      return requireClaim(reference);
    },

    verifyEmployer(query) {
      const normalized = query.trim().toLowerCase();
      if (
        normalized === REFERENCE_EMPLOYER.name.toLowerCase() ||
        normalized === REFERENCE_EMPLOYER.registrationNo.toLowerCase()
      ) {
        return { ...REFERENCE_EMPLOYER };
      }
      return { registered: false, status: "Unknown" };
    },

    receiveInjuryReport(_input: CppsInjuryReportInput) {
      return {
        reference: nextReceiptReference("INJ"),
        receivedAt: now().toISOString(),
      };
    },

    receiveEnquiry(_input: CppsEnquiryInput) {
      return {
        reference: nextReceiptReference("ENQ"),
        receivedAt: now().toISOString(),
      };
    },
  };
}
