import { NextResponse } from "next/server";
import { checkEmployerRegistration } from "@/lib/cpps/api";
import { employerVerifySchema, parseOrErrors } from "@/lib/security/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(`employer:${ip}`, 15, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(employerVerifySchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Enter an employer name or registration number." },
      { status: 400 },
    );
  }

  const result = await checkEmployerRegistration(parsed.data.query);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, result: result.data, source: result.source });
}
