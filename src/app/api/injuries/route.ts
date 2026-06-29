import { NextResponse } from "next/server";
import { reportWorkplaceInjury } from "@/lib/cpps/api";
import { injuryReportSchema, parseOrErrors } from "@/lib/security/validation";
import { verifyCaptcha } from "@/lib/security/captcha";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(`injury:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(injuryReportSchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please complete all required fields.", fields: parsed.errors },
      { status: 400 },
    );
  }

  const captchaOk = await verifyCaptcha(parsed.data.captchaToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Security check failed. Please try again." },
      { status: 400 },
    );
  }

  const result = await reportWorkplaceInjury({
    employerName: parsed.data.employerName,
    employerContact: parsed.data.employerContact,
    workerName: parsed.data.workerName,
    injuryDate: parsed.data.injuryDate,
    injuryType: parsed.data.injuryType,
    description: parsed.data.description,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    reference: result.data.reference,
    source: result.source,
  });
}
