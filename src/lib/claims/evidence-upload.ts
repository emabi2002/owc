const MAX_EVIDENCE_BYTES = 20 * 1024 * 1024;
const DEFAULT_EVIDENCE_TOKEN_TTL_MS = 15 * 60_000;
const EVIDENCE_TOKEN_SCOPE = "claim-evidence-upload";

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

type EvidenceUploadTokenPayload = {
  ref: string;
  exp: number;
  scope: typeof EVIDENCE_TOKEN_SCOPE;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function importEvidenceSigningKey(secret: string) {
  if (secret.trim().length < 32) {
    throw new Error("Evidence upload signing secret must be at least 32 characters");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function issueEvidenceUploadToken(
  claimReference: string,
  secret: string,
  options: { nowMs?: number; ttlMs?: number } = {},
): Promise<string> {
  const reference = sanitizeClaimReference(claimReference);
  if (!reference) throw new Error("Claim reference is required");

  const nowMs = options.nowMs ?? Date.now();
  const ttlMs = options.ttlMs ?? DEFAULT_EVIDENCE_TOKEN_TTL_MS;
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error("Evidence upload token lifetime must be positive");
  }

  const payload: EvidenceUploadTokenPayload = {
    ref: reference,
    exp: nowMs + ttlMs,
    scope: EVIDENCE_TOKEN_SCOPE,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadPart = base64UrlEncode(payloadBytes);
  const key = await importEvidenceSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  return `${payloadPart}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyEvidenceUploadToken(
  token: string,
  claimReference: string,
  secret: string,
  options: { nowMs?: number } = {},
): Promise<boolean> {
  const [payloadPart, signaturePart, extra] = token.trim().split(".");
  if (!payloadPart || !signaturePart || extra) return false;

  const payloadBytes = base64UrlDecode(payloadPart);
  const signatureBytes = base64UrlDecode(signaturePart);
  if (!payloadBytes || !signatureBytes) return false;

  let payload: EvidenceUploadTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as EvidenceUploadTokenPayload;
  } catch {
    return false;
  }

  const expectedReference = sanitizeClaimReference(claimReference);
  if (
    payload.scope !== EVIDENCE_TOKEN_SCOPE ||
    payload.ref !== expectedReference ||
    !Number.isFinite(payload.exp) ||
    payload.exp <= (options.nowMs ?? Date.now())
  ) {
    return false;
  }

  try {
    const key = await importEvidenceSigningKey(secret);
    return crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(payloadPart),
    );
  } catch {
    return false;
  }
}

export async function buildEvidenceUploadGrant(
  claimReference: string,
  secret: string,
  options: { nowMs?: number } = {},
): Promise<{ token: string; expiresInSeconds: number }> {
  const token = await issueEvidenceUploadToken(claimReference, secret, {
    nowMs: options.nowMs,
    ttlMs: DEFAULT_EVIDENCE_TOKEN_TTL_MS,
  });
  return {
    token,
    expiresInSeconds: DEFAULT_EVIDENCE_TOKEN_TTL_MS / 1000,
  };
}
