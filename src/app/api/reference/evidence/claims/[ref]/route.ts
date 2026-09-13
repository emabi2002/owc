import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import type {
  EvidenceCategory,
  EvidenceSecurityScanStatus,
} from "@/lib/claims/evidence";
import {
  getReferenceEvidenceHealth,
  listReferenceEvidence,
  storeReferenceEvidence,
} from "@/lib/claims/reference-evidence-repository";
import { isReferenceEvidenceRepositoryEnabled } from "@/lib/env";

const CATEGORIES = new Set<EvidenceCategory>([
  "Identity",
  "Medical",
  "Employment",
  "Employer",
  "Incident",
  "Banking",
  "Correspondence",
  "Other",
]);

const SYNTHETIC_SCAN_STATES = new Set<EvidenceSecurityScanStatus>([
  "clean",
  "infected",
  "unavailable",
  "not_configured",
]);

function disabled() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function requireEvidencePermission(permission: "evidence.view" | "evidence.manage") {
  const user = await getSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!hasPermission(user.role, permission)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  if (!isReferenceEvidenceRepositoryEnabled) return disabled();

  const access = await requireEvidencePermission("evidence.view");
  if ("response" in access) return access.response;

  const { ref } = await params;
  const claimReference = decodeURIComponent(ref).trim().toUpperCase();
  const evidence = await listReferenceEvidence(claimReference);

  return NextResponse.json({
    ...getReferenceEvidenceHealth(),
    claimReference,
    evidence,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  if (!isReferenceEvidenceRepositoryEnabled) return disabled();

  const access = await requireEvidencePermission("evidence.manage");
  if ("response" in access) return access.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 });
  }

  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "Other").trim() as EvidenceCategory;
  const simulatedScanState = String(
    form.get("syntheticScanState") ?? "not_configured",
  ).trim() as EvidenceSecurityScanStatus;
  const legalHold = String(form.get("legalHold") ?? "false").toLowerCase() === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Evidence file is required" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Evidence title is required" }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid evidence category" }, { status: 400 });
  }
  if (!SYNTHETIC_SCAN_STATES.has(simulatedScanState)) {
    return NextResponse.json({ error: "Invalid synthetic scan state" }, { status: 400 });
  }

  const { ref } = await params;
  const claimReference = decodeURIComponent(ref).trim().toUpperCase();

  try {
    const stored = await storeReferenceEvidence({
      claimReference,
      category,
      title,
      fileName: file.name,
      mimeType: file.type,
      bytes: await file.arrayBuffer(),
      uploadedBy: access.user.email,
      securityScan: simulatedScanState,
      legalHold,
    });

    return NextResponse.json({
      ...getReferenceEvidenceHealth(),
      note: "Security scan state is synthetic demonstration metadata; no production scanner result is asserted.",
      evidence: stored.metadata,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to store reference evidence" },
      { status: 400 },
    );
  }
}
