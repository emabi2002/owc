import { z } from "zod";
import type { ManagementReportRequest } from "@/lib/reporting/types";

const reportKindSchema = z.enum([
  "executive",
  "province",
  "employer",
  "aging",
  "category",
  "turnaround",
  "payments",
]);

export const managementIntentSchema = z
  .object({
    report: reportKindSchema,
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    province: z.string().trim().min(1).max(120).optional(),
    employer: z.string().trim().min(1).max(200).optional(),
    status: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export type ManagementIntentResult =
  | { supported: true; request: ManagementReportRequest; reason?: undefined }
  | { supported: false; reason: string; request?: undefined };

export function parseManagementIntent(value: unknown) {
  return managementIntentSchema.safeParse(value);
}

const WRITE_OR_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?rules/i,
  /\bupdate\b/i,
  /\bdelete\b/i,
  /\binsert\b/i,
  /\bdrop\s+table\b/i,
  /\balter\s+table\b/i,
  /\bchange\b.*\b(payment|claim|status|amount)\b/i,
  /\bapprove\b.*\bclaim/i,
  /\breassign\b/i,
];

function unsafeQuestion(question: string): boolean {
  return WRITE_OR_INJECTION_PATTERNS.some((pattern) => pattern.test(question));
}

export function interpretReferenceManagementQuestion(
  question: string,
): ManagementIntentResult {
  const normalized = question.trim();
  if (!normalized) {
    return { supported: false, reason: "A management reporting question is required." };
  }

  if (unsafeQuestion(normalized)) {
    return {
      supported: false,
      reason:
        "The Management AI Analyst is read-only and cannot perform operational changes, arbitrary SQL, approvals, reassignment or payment actions.",
    };
  }

  const q = normalized.toLocaleLowerCase();
  let request: ManagementReportRequest | null = null;

  if (/\bprovince|provincial|region\b/.test(q)) {
    request = { report: "province" };
  } else if (/\bemployer|company|companies\b/.test(q)) {
    request = { report: "employer" };
  } else if (/\b90\s*days|aging|ageing|older than|outstanding for|overdue\b/.test(q)) {
    request = { report: "aging" };
  } else if (/\bturnaround|processing time|how long|duration\b/.test(q)) {
    request = { report: "turnaround" };
  } else if (/\bpayment|compensation|paid|payout\b/.test(q)) {
    request = { report: "payments" };
  } else if (/\binjury|category|type of claim|claim type\b/.test(q)) {
    request = { report: "category" };
  } else if (/\bstatus|summary|total claims|how many claims|claims total\b/.test(q)) {
    request = { report: "executive" };
  }

  if (!request) {
    return {
      supported: false,
      reason: "The question is outside the approved OWC management reporting domains.",
    };
  }

  const parsed = managementIntentSchema.safeParse(request);
  if (!parsed.success) {
    return { supported: false, reason: "The requested report could not be validated." };
  }
  return { supported: true, request: parsed.data };
}
