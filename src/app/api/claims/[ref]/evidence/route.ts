import { NextResponse } from "next/server";
import {
  buildEvidenceStoragePath,
  sha256Hex,
  validateEvidenceFile,
  verifyEvidenceUploadToken,
} from "@/lib/claims/evidence-upload";
import {
  scanEvidenceBytes,
  shouldBlockEvidenceUpload,
} from "@/lib/claims/malware-scan";
import { recordAudit } from "@/lib/data/audit";
import { serverEnv } from "@/lib/env";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const CATEGORIES = new Set([
  "Identity",
  "Medical",
  "Employment",
  "Employer",
  "Incident",
  "Banking",
  "Correspondence",
  "Other",
]);

function bearerToken(headers: Headers): string {
  const authorization = headers.get("authorization") ?? "";
  const [scheme, token] = authorization.trim().split(/\s+/, 2);
  return scheme?.toLowerCase() === "bearer" ? token ?? "" : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`claimant-evidence:${ip}`, 8, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many evidence uploads. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const { ref } = await params;
  const claimReference = decodeURIComponent(ref).trim().toUpperCase();
  const signingSecret = serverEnv.evidenceUploadSigningSecret.trim();
  if (signingSecret.length < 32) {
    return NextResponse.json(
      { error: "Claimant evidence upload is not configured" },
      { status: 503 },
    );
  }

  const token = bearerToken(request.headers);
  if (
    !token ||
    !(await verifyEvidenceUploadToken(token, claimReference, signingSecret))
  ) {
    return NextResponse.json(
      { error: "Evidence upload authorization is invalid or expired" },
      { status: 401 },
    );
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Evidence storage is not configured" },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 });
  }

  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "Other").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Evidence file is required" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Evidence title is required" }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid evidence category" }, { status: 400 });
  }

  const validation = validateEvidenceFile(file.name, file.type, file.size);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const malwareScan = await scanEvidenceBytes({
    bytes,
    fileName: file.name,
    mimeType: file.type,
    endpoint: serverEnv.malwareScanUrl,
    apiKey: serverEnv.malwareScanApiKey,
  });

  if (shouldBlockEvidenceUpload(malwareScan, serverEnv.requireMalwareScan)) {
    await recordAudit({
      action: "update",
      entity: "claim_evidence",
      entityId: claimReference,
      summary: `claim evidence: claimant upload blocked for ${claimReference}`,
      metadata: {
        source: "claimant",
        category,
        mimeType: file.type,
        sizeBytes: file.size,
        securityScan: malwareScan.status,
      },
    });

    return NextResponse.json(
      {
        error:
          malwareScan.status === "infected"
            ? "Evidence file failed security scanning"
            : "Evidence security scanning is temporarily unavailable",
      },
      { status: malwareScan.status === "infected" ? 400 : 503 },
    );
  }

  const sha256 = await sha256Hex(bytes);
  const objectId = crypto.randomUUID();
  const storagePath = buildEvidenceStoragePath(claimReference, file.name, objectId);

  const { error: storageError } = await admin.storage
    .from("claim-evidence")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "private, max-age=0",
    });

  if (storageError) {
    return NextResponse.json(
      { error: "Unable to store evidence" },
      { status: 502 },
    );
  }

  const metadataClient = admin as unknown as {
    from: (table: string) => {
      insert: (values: Record<string, unknown>) => Promise<{
        error: { message?: string } | null;
      }>;
    };
  };

  const { error: metadataError } = await metadataClient.from("claim_evidence").insert({
    claim_reference: claimReference,
    category,
    title,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    storage_path: storagePath,
    sha256,
    status: "Pending Review",
    uploaded_by: "Claimant portal",
    uploaded_by_id: null,
    metadata: {
      source: "claimant",
      original_name: file.name,
      malware_scan_status: malwareScan.status,
    },
  });

  if (metadataError) {
    await admin.storage.from("claim-evidence").remove([storagePath]);
    return NextResponse.json(
      { error: "Unable to register evidence metadata" },
      { status: 502 },
    );
  }

  await recordAudit({
    action: "create",
    entity: "claim_evidence",
    entityId: claimReference,
    summary: `claim evidence: claimant uploaded ${category} evidence for ${claimReference}`,
    metadata: {
      source: "claimant",
      category,
      mimeType: file.type,
      sizeBytes: file.size,
      sha256,
      securityScan: malwareScan.status,
    },
  });

  return NextResponse.json(
    {
      claimReference,
      title,
      category,
      fileName: file.name,
      sizeBytes: file.size,
      sha256,
      status: "Pending Review",
      securityScan: malwareScan.status,
    },
    { status: 201 },
  );
}
