import type {
  ClaimEvidence,
  EvidenceCategory,
  EvidenceSecurityScanStatus,
} from "@/lib/claims/evidence";
import {
  buildEvidenceStoragePath,
  sha256Hex,
  validateEvidenceFile,
} from "@/lib/claims/evidence-upload";
import {
  buildEvidenceReviewUpdate,
  type EvidenceReviewStatus,
} from "@/lib/claims/evidence-review";
import { shouldBlockEvidenceUpload } from "@/lib/claims/malware-scan";

export type ReferenceEvidenceHealth = {
  source: "reference";
  synthetic: true;
  productionConnected: false;
  durable: false;
};

export type ReferenceEvidenceObject = {
  metadata: ClaimEvidence;
  bytes: Uint8Array;
};

export type StoreReferenceEvidenceInput = {
  claimReference: string;
  category: EvidenceCategory;
  title: string;
  fileName: string;
  mimeType: string;
  bytes: ArrayBuffer;
  uploadedBy: string;
  securityScan: EvidenceSecurityScanStatus;
  retentionUntil?: string;
  legalHold: boolean;
};

export type ReviewReferenceEvidenceInput = {
  claimReference: string;
  objectId: string;
  nextStatus: EvidenceReviewStatus;
  reviewerId: string | null;
  reviewedAt?: string;
};

const store = new Map<string, ReferenceEvidenceObject>();
let objectSequence = 0;
let initialized = false;

const FIXTURE_CLAIM = "OWC-REF-2026-0001";
const FIXTURE_TIMESTAMP = "2026-09-14T00:00:00.000Z";

function normalizeClaimReference(reference: string): string {
  return reference.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function repositoryKey(claimReference: string, objectId: string): string {
  return `${normalizeClaimReference(claimReference)}::${objectId.trim()}`;
}

function copyBytes(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(bytes);
}

async function createFixture(input: {
  id: string;
  category: EvidenceCategory;
  title: string;
  fileName: string;
  content: string;
}): Promise<ReferenceEvidenceObject> {
  const bytes = new TextEncoder().encode(input.content);
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const sha256 = await sha256Hex(buffer);
  return {
    metadata: {
      id: input.id,
      claimReference: FIXTURE_CLAIM,
      category: input.category,
      title: input.title,
      fileName: input.fileName,
      mimeType: "application/pdf",
      sizeBytes: bytes.byteLength,
      uploadedAt: FIXTURE_TIMESTAMP,
      uploadedBy: "OWC Reference Demonstration",
      status: "Verified",
      sha256,
      storagePath: buildEvidenceStoragePath(
        FIXTURE_CLAIM,
        input.fileName,
        input.id,
      ),
      securityScan: "clean",
      legalHold: false,
    },
    bytes: copyBytes(bytes),
  };
}

async function ensureInitialized(): Promise<void> {
  if (!initialized) await resetReferenceEvidenceRepository();
}

export function isReferenceEvidenceRepositoryEnabled(
  value = process.env.OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY,
): boolean {
  return value === "true";
}

export function getReferenceEvidenceHealth(): ReferenceEvidenceHealth {
  return {
    source: "reference",
    synthetic: true,
    productionConnected: false,
    durable: false,
  };
}

export async function resetReferenceEvidenceRepository(): Promise<void> {
  store.clear();
  objectSequence = 2;

  const fixtures = await Promise.all([
    createFixture({
      id: "ref-evidence-000001",
      category: "Incident",
      title: "Synthetic workplace incident summary",
      fileName: "reference-incident-summary.pdf",
      content:
        "OWC REFERENCE DEMONSTRATION DOCUMENT — SYNTHETIC ONLY — NO REAL CLAIMANT, MEDICAL OR BANKING DATA.",
    }),
    createFixture({
      id: "ref-evidence-000002",
      category: "Employment",
      title: "Synthetic employment confirmation",
      fileName: "reference-employment-confirmation.pdf",
      content:
        "OWC REFERENCE DEMONSTRATION DOCUMENT — SYNTHETIC EMPLOYMENT CONFIRMATION ONLY — NOT A REAL RECORD.",
    }),
  ]);

  for (const fixture of fixtures) {
    store.set(
      repositoryKey(fixture.metadata.claimReference, fixture.metadata.id),
      fixture,
    );
  }
  initialized = true;
}

export async function listReferenceEvidence(
  claimReference: string,
): Promise<ClaimEvidence[]> {
  await ensureInitialized();
  const normalized = normalizeClaimReference(claimReference);
  return [...store.values()]
    .filter((item) => item.metadata.claimReference === normalized)
    .map((item) => ({ ...item.metadata }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export async function storeReferenceEvidence(
  input: StoreReferenceEvidenceInput,
): Promise<ReferenceEvidenceObject> {
  await ensureInitialized();
  const claimReference = normalizeClaimReference(input.claimReference);
  if (!claimReference) throw new Error("Claim reference is required");
  if (!input.title.trim()) throw new Error("Evidence title is required");

  const validation = validateEvidenceFile(
    input.fileName,
    input.mimeType,
    input.bytes.byteLength,
  );
  if (!validation.ok) throw new Error(validation.reason);

  const objectId = `ref-evidence-${String(++objectSequence).padStart(6, "0")}`;
  const storagePath = buildEvidenceStoragePath(
    claimReference,
    input.fileName,
    objectId,
  );
  const sha256 = await sha256Hex(input.bytes);
  const bytes = new Uint8Array(input.bytes.slice(0));

  const metadata: ClaimEvidence = {
    id: objectId,
    claimReference,
    category: input.category,
    title: input.title.trim(),
    fileName: storagePath.split("/").at(-1) ?? input.fileName,
    mimeType: input.mimeType,
    sizeBytes: bytes.byteLength,
    uploadedAt: new Date().toISOString(),
    uploadedBy: input.uploadedBy.trim() || "OWC Reference Demonstration",
    status: "Pending Review",
    sha256,
    storagePath,
    securityScan: input.securityScan,
    ...(input.retentionUntil ? { retentionUntil: input.retentionUntil } : {}),
    legalHold: input.legalHold,
  };

  const record: ReferenceEvidenceObject = { metadata, bytes };
  store.set(repositoryKey(claimReference, objectId), record);
  return { metadata: { ...metadata }, bytes: copyBytes(bytes) };
}

export async function getReferenceEvidence(
  claimReference: string,
  objectId: string,
  options: { requireScanner?: boolean } = {},
): Promise<ReferenceEvidenceObject | null> {
  await ensureInitialized();
  const record = store.get(repositoryKey(claimReference, objectId));
  if (!record) return null;

  const scanStatus = record.metadata.securityScan ?? "not_configured";
  if (
    shouldBlockEvidenceUpload(
      { status: scanStatus } as
        | { status: "clean" }
        | { status: "infected" }
        | { status: "unavailable" }
        | { status: "not_configured" },
      options.requireScanner ?? false,
    )
  ) {
    return null;
  }

  return {
    metadata: { ...record.metadata },
    bytes: copyBytes(record.bytes),
  };
}

export async function reviewReferenceEvidence(
  input: ReviewReferenceEvidenceInput,
): Promise<ClaimEvidence | null> {
  await ensureInitialized();
  const key = repositoryKey(input.claimReference, input.objectId);
  const record = store.get(key);
  if (!record) return null;

  const review = buildEvidenceReviewUpdate({
    currentStatus: record.metadata.status,
    nextStatus: input.nextStatus,
    reviewerId: input.reviewerId,
    reviewedAt: input.reviewedAt,
  });

  record.metadata = {
    ...record.metadata,
    status: review.status,
  };
  store.set(key, record);
  return { ...record.metadata };
}
