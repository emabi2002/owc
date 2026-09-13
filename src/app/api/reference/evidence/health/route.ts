import { NextResponse } from "next/server";
import { isReferenceEvidenceRepositoryEnabled } from "@/lib/env";
import { getReferenceEvidenceHealth } from "@/lib/claims/reference-evidence-repository";

export async function GET() {
  if (!isReferenceEvidenceRepositoryEnabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(getReferenceEvidenceHealth(), {
    headers: { "Cache-Control": "no-store" },
  });
}
