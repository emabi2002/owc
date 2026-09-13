import { NextResponse } from "next/server";
import { toCppsClaimStatus } from "@/lib/cpps/reference/contract";
import {
  isReferenceCppsHttpEnabled,
  referenceCppsUnavailableResponse,
} from "@/lib/cpps/reference/http";
import { referenceCppsService } from "@/lib/cpps/reference/runtime";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string }> },
) {
  if (!isReferenceCppsHttpEnabled()) return referenceCppsUnavailableResponse();

  const limited = rateLimit(
    `reference:cpps:claim-status:${getClientIp(request.headers)}`,
    60,
  );
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  const { reference } = await context.params;
  const normalized = reference.trim().toUpperCase();
  if (!/^CPPS-REF-\d{4}-\d{6}$/.test(normalized)) {
    return NextResponse.json(
      { source: "reference", productionConnected: false, error: "Claim not found" },
      { status: 404 },
    );
  }

  const claim = referenceCppsService.getClaim(normalized);
  if (!claim) {
    return NextResponse.json(
      { source: "reference", productionConnected: false, error: "Claim not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    source: "reference",
    productionConnected: false,
    durable: false,
    data: toCppsClaimStatus(claim),
  });
}
