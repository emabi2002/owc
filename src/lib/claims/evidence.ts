import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type EvidenceCategory =
  | "Identity"
  | "Medical"
  | "Employment"
  | "Employer"
  | "Incident"
  | "Banking"
  | "Correspondence"
  | "Other";

export type EvidenceSecurityScanStatus =
  | "clean"
  | "infected"
  | "unavailable"
  | "not_configured";

export type ClaimEvidence = {
  id: string;
  claimReference: string;
  category: EvidenceCategory;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  status: "Verified" | "Pending Review" | "Rejected";
  sha256?: string;
  storagePath?: string;
  securityScan?: EvidenceSecurityScanStatus;
  retentionUntil?: string;
  legalHold: boolean;
};

const REFERENCE_EVIDENCE: ClaimEvidence[] = [
  {
    id: "ev-1",
    claimReference: "OWC-2026-004821",
    category: "Identity",
    title: "National identity verification",
    fileName: "identity-verification.pdf",
    mimeType: "application/pdf",
    sizeBytes: 184320,
    uploadedAt: "2026-04-18T03:20:00Z",
    uploadedBy: "J. Kaupa",
    status: "Verified",
    sha256: "42b9b1474c58c4de5ab6a2229081db579cc6f07ef55e5bd857495eab9e4732e1",
    securityScan: "clean",
    legalHold: false,
  },
  {
    id: "ev-2",
    claimReference: "OWC-2026-004821",
    category: "Medical",
    title: "Medical practitioner's first report",
    fileName: "MED-1-JKaupa.pdf",
    mimeType: "application/pdf",
    sizeBytes: 438272,
    uploadedAt: "2026-04-18T03:24:00Z",
    uploadedBy: "J. Kaupa",
    status: "Verified",
    sha256: "08ddac9c9d28a57b52049f70f7c95932302cc430ef7891686d02b98ef6a71385",
    securityScan: "clean",
    legalHold: false,
  },
  {
    id: "ev-3",
    claimReference: "OWC-2026-004821",
    category: "Employment",
    title: "Employment and wage confirmation",
    fileName: "employment-confirmation.pdf",
    mimeType: "application/pdf",
    sizeBytes: 266240,
    uploadedAt: "2026-04-18T03:29:00Z",
    uploadedBy: "Highlands Construction Ltd",
    status: "Verified",
    sha256: "c6df1e4de6fb27eb63ac1947e12218aa0280038152f51daf70e66bc31af1bbc6",
    securityScan: "clean",
    legalHold: false,
  },
  {
    id: "ev-4",
    claimReference: "OWC-2026-004821",
    category: "Incident",
    title: "Workplace incident report",
    fileName: "incident-report.pdf",
    mimeType: "application/pdf",
    sizeBytes: 348160,
    uploadedAt: "2026-04-19T01:15:00Z",
    uploadedBy: "Highlands Construction Ltd",
    status: "Verified",
    sha256: "e9de1e68b0433d914adb7907379415347945151173dbf507f240e4c612b0bc7f",
    securityScan: "clean",
    legalHold: false,
  },
];

export async function getClaimEvidence(
  claimReference: string,
): Promise<ClaimEvidence[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return REFERENCE_EVIDENCE.filter(
      (item) => item.claimReference === claimReference,
    );
  }

  const db = supabase as unknown as SupabaseClient;
  const { data, error } = await db
    .from("claim_evidence")
    .select("*")
    .eq("claim_reference", claimReference)
    .order("uploaded_at", { ascending: true });

  if (error) {
    return REFERENCE_EVIDENCE.filter(
      (item) => item.claimReference === claimReference,
    );
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    claimReference: String(row.claim_reference),
    category: String(row.category) as EvidenceCategory,
    title: String(row.title),
    fileName: String(row.file_name),
    mimeType: String(row.mime_type),
    sizeBytes: Number(row.size_bytes ?? 0),
    uploadedAt: String(row.uploaded_at),
    uploadedBy: String(row.uploaded_by ?? "OWC"),
    status: String(row.status) as ClaimEvidence["status"],
    sha256: row.sha256 ? String(row.sha256) : undefined,
    storagePath: row.storage_path ? String(row.storage_path) : undefined,
    securityScan: row.security_scan_status
      ? (String(row.security_scan_status) as EvidenceSecurityScanStatus)
      : undefined,
    retentionUntil: row.retention_until ? String(row.retention_until) : undefined,
    legalHold: Boolean(row.legal_hold),
  }));
}

export function formatEvidenceSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
