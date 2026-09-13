import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import { getReferenceEvidence } from "@/lib/claims/reference-evidence-repository";
import { isReferenceEvidenceRepositoryEnabled, serverEnv } from "@/lib/env";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ ref: string; objectId: string }> },
) {
  if (!isReferenceEvidenceRepositoryEnabled) return notFound();

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.role, "evidence.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ref, objectId } = await params;
  const claimReference = decodeURIComponent(ref).trim().toUpperCase();
  const safeObjectId = decodeURIComponent(objectId).trim();
  if (!/^ref-evidence-\d{6}$/.test(safeObjectId)) return notFound();

  const evidence = await getReferenceEvidence(claimReference, safeObjectId, {
    requireScanner: serverEnv.requireMalwareScan,
  });
  if (!evidence) return notFound();

  const body = evidence.bytes.buffer.slice(
    evidence.bytes.byteOffset,
    evidence.bytes.byteOffset + evidence.bytes.byteLength,
  ) as ArrayBuffer;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": evidence.metadata.mimeType,
      "Content-Disposition": `attachment; filename="${evidence.metadata.fileName.replace(/["\r\n]/g, "")}"`,
      "Content-Length": String(evidence.metadata.sizeBytes),
      "Cache-Control": "no-store",
      "X-OWC-Source": "reference",
      "X-OWC-Durable": "false",
      "X-OWC-SHA256": evidence.metadata.sha256 ?? "",
    },
  });
}
