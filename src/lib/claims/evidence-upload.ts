const MAX_EVIDENCE_BYTES = 20 * 1024 * 1024;

const ALLOWED_EVIDENCE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function validateEvidenceFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): { ok: true } | { ok: false; reason: string } {
  if (!fileName.trim()) return { ok: false, reason: "File name is required" };
  if (!ALLOWED_EVIDENCE_TYPES.has(mimeType)) {
    return { ok: false, reason: "Unsupported evidence file type" };
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, reason: "Evidence file is empty" };
  }
  if (sizeBytes > MAX_EVIDENCE_BYTES) {
    return { ok: false, reason: "Evidence file exceeds the 20 MB limit" };
  }
  return { ok: true };
}

function sanitizeFileName(fileName: string): string {
  const parts = fileName.trim().toLowerCase().split(".");
  const extension = parts.length > 1 ? `.${parts.pop()}` : "";
  const base = parts
    .join(".")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "evidence";
  const safeExtension = extension.replace(/[^.a-z0-9]/g, "");
  return `${base}${safeExtension}`;
}

function sanitizeClaimReference(reference: string): string {
  return reference.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function buildEvidenceStoragePath(
  claimReference: string,
  fileName: string,
  objectId: string,
): string {
  const reference = sanitizeClaimReference(claimReference);
  const id = objectId.trim().replace(/[^a-zA-Z0-9-]/g, "");
  return `claims/${reference}/${id}/${sanitizeFileName(fileName)}`;
}

export async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
