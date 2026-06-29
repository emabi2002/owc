import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/data/audit";
import { parseOrErrors } from "@/lib/security/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

const mfaSchema = z.object({
  factorId: z.string().min(1),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`mfa:${ip}`, 6, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(mfaSchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Enter the 6-digit verification code." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth unavailable." }, { status: 503 });
  }

  const { factorId, code } = parsed.data;
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) {
    await recordAudit({
      action: "failed_login",
      entity: "auth",
      summary: "Failed MFA verification",
      ip,
    });
    return NextResponse.json(
      { error: "Invalid verification code." },
      { status: 401 },
    );
  }

  await recordAudit({
    action: "login",
    entity: "auth",
    summary: "MFA verification successful",
    ip,
  });

  return NextResponse.json({ ok: true });
}
