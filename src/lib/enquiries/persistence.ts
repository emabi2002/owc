import { randomBytes } from "node:crypto";
import type { ConfirmedEnquiryInput, PersistedEnquiryRecord } from "./types";

export type LiveEnquiryWriter = (
  record: PersistedEnquiryRecord,
) => Promise<PersistedEnquiryRecord>;

const referenceRecords = new Map<string, PersistedEnquiryRecord>();
const idempotencyReferences = new Map<string, string>();

function suffix(): string {
  return randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

function referenceFor(now: Date, referenceSuffix?: string): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const tail = (referenceSuffix ?? suffix()).replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
  return `OWC-ENQ-${date}-${tail || suffix()}`;
}

export function clearReferenceEnquiries(): void {
  referenceRecords.clear();
  idempotencyReferences.clear();
}

export function getReferenceEnquiry(reference: string): PersistedEnquiryRecord | null {
  return referenceRecords.get(reference) ?? null;
}

export async function persistConfirmedEnquiry(
  input: ConfirmedEnquiryInput,
  options: {
    mode: "reference" | "live";
    writer?: LiveEnquiryWriter;
    now?: Date;
    referenceSuffix?: string;
  },
): Promise<PersistedEnquiryRecord> {
  if (!input.confirmed) {
    throw new Error("Explicit user confirmation is required before enquiry persistence.");
  }

  if (input.idempotencyKey) {
    const existingReference = idempotencyReferences.get(input.idempotencyKey);
    const existing = existingReference ? referenceRecords.get(existingReference) : null;
    if (existing && options.mode === "reference") return existing;
  }

  const now = options.now ?? new Date();
  const record: PersistedEnquiryRecord = {
    ...input,
    reference: referenceFor(now, options.referenceSuffix),
    confirmedAt: now.toISOString(),
    status: "new",
    productionConnected: options.mode === "live",
    synthetic: options.mode === "reference",
  };

  if (options.mode === "reference") {
    referenceRecords.set(record.reference, record);
    if (input.idempotencyKey) idempotencyReferences.set(input.idempotencyKey, record.reference);
    return record;
  }

  if (!options.writer) {
    throw new Error("Live enquiry persistence is unavailable.");
  }
  return options.writer(record);
}
