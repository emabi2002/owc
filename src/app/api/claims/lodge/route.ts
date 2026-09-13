import { NextResponse } from "next/server";
import { buildEvidenceUploadGrant } from "@/lib/claims/evidence-upload";
import { submitClaimLodgement } from "@/lib/cpps/api";
import { serverEnv } from "@/lib/env";
import { verifyCaptcha } from "@/lib/security/captcha";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { claimLodgeSchema, parseOrErrors } from "@/lib/security/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(`lodge:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(claimLodgeSchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please complete all required fields.", fields: parsed.errors },
      { status: 400 },
    );
  }

  if (!parsed.data.declaration) {
    return NextResponse.json(
      { error: "You must confirm the declaration to proceed." },
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

  const result = await submitClaimLodgement({
    workerName: parsed.data.workerName,
    workerPhone: parsed.data.workerPhone,
    workerEmail: parsed.data.workerEmail || undefined,
    employerName: parsed.data.employerName,
    province: parsed.data.province,
    occupation: parsed.data.occupation,
    weeklyWage: parsed.data.weeklyWage,
    injuryDate: parsed.data.injuryDate,
    injuryType: parsed.data.injuryType,
    description: parsed.data.description,
    documentCount: parsed.data.documentCount,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // Mirror into the local claim_tracking table for the tracking UI.
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from("claim_tracking").insert({
      reference: result.data.reference,
      worker_name: parsed.data.workerName,
      employer_name: parsed.data.employerName,
      injury_type: parsed.data.injuryType ?? null,
      injury_date: parsed.data.injuryDate,
      status: "New",
    });
  }

  const evidenceGrant =
    serverEnv.evidenceUploadSigningSecret.trim().length >= 32
      ? await buildEvidenceUploadGrant(
          result.data.reference,
          serverEnv.evidenceUploadSigningSecret,
        )
      : null;

  return NextResponse.json({
    ok: true,
    reference: result.data.reference,
    source: result.source,
    ...(evidenceGrant
      ? {
          evidenceUploadToken: evidenceGrant.token,
          evidenceUploadExpiresInSeconds: evidenceGrant.expiresInSeconds,
        }
      : {}),
  });
}
