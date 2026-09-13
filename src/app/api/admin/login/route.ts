import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/data/audit";
import { loginSchema, parseOrErrors } from "@/lib/security/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import {
  authenticateDemoPrincipal,
  DEMO_MFA_COOKIE,
  demoMfaCookieOptions,
  issueDemoMfaToken,
  recordDemoIdentityEvent,
} from "@/lib/auth/demo-identity";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  // Brute-force protection: 5 attempts / minute / IP.
  const limit = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(loginSchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please enter a valid email and password.", fields: parsed.errors },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  if (isDemonstrationIdentityMode()) {
    const principal = authenticateDemoPrincipal(email, password);
    if (!principal || principal.principalType !== "staff" || !principal.role) {
      recordDemoIdentityEvent("login_failed");
      await recordAudit({
        action: "failed_login",
        entity: "auth",
        summary: `Demonstration sign-in failed: ${email}`,
        actorEmail: email,
        ip,
      });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    recordDemoIdentityEvent("login_succeeded", principal);
    recordDemoIdentityEvent("mfa_challenged", principal);
    await recordAudit({
      action: "login",
      entity: "auth",
      summary: `Demonstration primary authentication succeeded: ${principal.email}`,
      actorId: principal.id,
      actorEmail: principal.email,
      ip,
    });

    const response = NextResponse.json({
      ok: true,
      mfaRequired: principal.mfaRequired,
      factorId: "owc-demo-totp",
      demonstration: true,
    });
    response.cookies.set(
      DEMO_MFA_COOKIE,
      issueDemoMfaToken(principal),
      demoMfaCookieOptions,
    );
    return response;
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Authentication is unavailable. Configure the approved live identity provider before staff sign-in.",
      },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    await recordAudit({
      action: "failed_login",
      entity: "auth",
      summary: `Failed sign-in: ${email}`,
      actorEmail: email,
      ip,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  // MFA-ready: detect whether a second factor is required.
  let mfaRequired = false;
  let factorId: string | undefined;
  try {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.currentLevel === "aal1" && aal.nextLevel === "aal2") {
      mfaRequired = true;
      const { data: factors } = await supabase.auth.mfa.listFactors();
      factorId = factors?.totp?.[0]?.id;
    }
  } catch {
    // MFA not enrolled — continue.
  }

  await recordAudit({
    action: "login",
    entity: "auth",
    summary: `Signed in: ${email}`,
    actorId: data.user.id,
    actorEmail: email,
    ip,
  });

  // Update last-active timestamp (best effort).
  await supabase
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", data.user.id);

  return NextResponse.json({ ok: true, mfaRequired, factorId });
}
