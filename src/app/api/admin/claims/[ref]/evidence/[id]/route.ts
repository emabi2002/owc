import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import {
  EVIDENCE_REVIEW_STATUSES,
  buildEvidenceReviewUpdate,
  type EvidenceReviewStatus,
} from "@/lib/claims/evidence-review";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function normalizeClaimReference(value: string) {
  return decodeURIComponent(value).trim().toUpperCase();
}

async function loadEvidenceRecord(admin: ReturnType<typeof createAdminSupabaseClient>, id: string, claimReference: string) {
  if (!admin) return null;
  const db = admin as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          eq: (column: string, value: string) => {
            maybeSingle: () => Promise<{
              data: Record<string, unknown> | null;
              error: { message?: string } | null;
            }>;
          };
        };
      };
    };
  };

  const { data, error } = await db
    .from("claim_evidence")
    .select("id, claim_reference, status, storage_path, file_name, mime_type")
    .eq("id", id)
    .eq("claim_reference", claimReference)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string; id: string }> },
) {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "claims.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Evidence storage is not configured" }, { status: 503 });
  }

  const { ref, id } = await params;
  const claimReference = normalizeClaimReference(ref);
  const evidence = await loadEvidenceRecord(admin, id, claimReference);
  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  const storagePath = String(evidence.storage_path ?? "");
  if (!storagePath) {
    return NextResponse.json({ error: "Evidence object is unavailable" }, { status: 404 });
  }

  const { data, error } = await admin.storage
    .from("claim-evidence")
    .createSignedUrl(storagePath, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to open evidence" }, { status: 502 });
  }

  return NextResponse.json({
    claimReference,
    evidenceId: id,
    fileName: String(evidence.file_name ?? "evidence"),
    mimeType: String(evidence.mime_type ?? "application/octet-stream"),
    url: data.signedUrl,
    expiresInSeconds: 60,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ref: string; id: string }> },
) {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "claims.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Evidence storage is not configured" }, { status: 503 });
  }

  const { ref, id } = await params;
  const claimReference = normalizeClaimReference(ref);
  const evidence = await loadEvidenceRecord(admin, id, claimReference);
  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nextStatus =
    typeof body === "object" && body !== null && "status" in body
      ? String((body as { status?: unknown }).status)
      : "";

  if (!EVIDENCE_REVIEW_STATUSES.includes(nextStatus as EvidenceReviewStatus)) {
    return NextResponse.json({ error: "Invalid review status" }, { status: 400 });
  }

  let update: ReturnType<typeof buildEvidenceReviewUpdate>;
  try {
    update = buildEvidenceReviewUpdate({
      currentStatus: String(evidence.status) as "Verified" | "Pending Review" | "Rejected",
      nextStatus: nextStatus as EvidenceReviewStatus,
      reviewerId: user.id === "demo-admin" ? null : user.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Evidence has already been reviewed" },
      { status: 409 },
    );
  }

  const db = admin as unknown as {
    from: (table: string) => {
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: string) => {
          eq: (column: string, value: string) => Promise<{
            error: { message?: string } | null;
          }>;
        };
      };
    };
  };

  const { error } = await db
    .from("claim_evidence")
    .update(update)
    .eq("id", id)
    .eq("claim_reference", claimReference);

  if (error) {
    return NextResponse.json({ error: "Unable to update evidence review" }, { status: 502 });
  }

  return NextResponse.json({
    claimReference,
    evidenceId: id,
    status: update.status,
    reviewedAt: update.verified_at,
  });
}
