import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/data/audit";
import { parseOrErrors } from "@/lib/security/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import {
  DEMO_MFA_COOKIE,
  DEMO_SESSION_COOKIE,
  demoSessionCookieOptions,
  isDemoIdentityConfigured,
  issueDemoSessionToken,
  recordDemoIdentityEvent,
  verifyDemoMfaCode,
  verifyDemoMfaToken,
} from "@/lib/auth/demo-identity";

const mfaSchema = z.object({
  factorId: z.string().min(1),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function POST(request: NextRequest) {
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

  const { factorId, code } = parsed.data;

  if (isDemonstrationIdentityMode()) {
    if (!isDemoIdentityConfigured()) {
      return NextResponse.json(
        {
          error:
            "The OWC demonstration identity service is not configured. Contact the presentation administrator.",
        },
        { status: 503 },
      );
    }

    const pendingToken = request.cookies.get(DEMO_MFA_COOKIE)?.value;
    const principal = pendingToken ? verifyDemoMfaToken(pendingToken) : null;
    if (
      factorId !== "owc-demo-totp" ||
      !principal ||
      principal.principalType !== "staff" ||
      !principal.role ||
      !verifyDemoMfaCode(code)
    ) {
      recordDemoIdentityEvent("mfa_failed", principal ?? undefined);
      await recordAudit({
        action: "failed_login",
        entity: "auth",
        summary: "Demonstration MFA verification failed",
        actorId: principal?.id,
        actorEmail: principal?.email,
        ip,
      });
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 401 },
      );
    }

    recordDemoIdentityEvent("mfa_succeeded", principal);
    await recordAudit({
      action: "login",
      entity: "auth",
      summary: `Demonstration MFA verification successful: ${principal.email}`,
      actorId: principal.id,
      actorEmail: principal.email,
      ip,
    });

    const response = NextResponse.json({ ok: true, demonstration: true });
    response.cookies.set(
      DEMO_SESSION_COOKIE,
      issueDemoSessionToken(principal),
      demoSessionCookieOptions,
    );
    response.cookies.delete(DEMO_MFA_COOKIE);
    return response;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth unavailable." }, { status: 503 });
  }

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
