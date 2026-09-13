import { NextResponse } from "next/server";
import {
  isReferenceCppsHttpEnabled,
  referenceCppsUnavailableResponse,
} from "@/lib/cpps/reference/http";
import { referenceCppsService } from "@/lib/cpps/reference/runtime";
import { claimLodgeSchema } from "@/lib/security/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!isReferenceCppsHttpEnabled()) return referenceCppsUnavailableResponse();

  const limited = rateLimit(
    `reference:cpps:claims:${getClientIp(request.headers)}`,
    30,
  );
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = claimLodgeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const claim = referenceCppsService.registerClaim(parsed.data);
  return NextResponse.json(
    {
      source: "reference",
      productionConnected: false,
      durable: false,
      data: {
        reference: claim.reference,
        receivedAt: claim.receivedAt,
        state: claim.state,
      },
    },
    { status: 201 },
  );
}
