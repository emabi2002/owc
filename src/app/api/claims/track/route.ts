import { NextResponse } from "next/server";
import { getClaimStatus } from "@/lib/cpps/api";
import { claimTrackSchema, parseOrErrors } from "@/lib/security/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(`track:${ip}`, 20, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(claimTrackSchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Enter a valid claim reference." },
      { status: 400 },
    );
  }

  const result = await getClaimStatus(parsed.data.reference, parsed.data.surname);
  if (!result.ok) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  return NextResponse.json({ found: true, claim: result.data });
}
