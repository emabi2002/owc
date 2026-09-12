import { NextResponse } from "next/server";
import { buildHealthSummary } from "@/lib/operations/health";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(buildHealthSummary(), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
