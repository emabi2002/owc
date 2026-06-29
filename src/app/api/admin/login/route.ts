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

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable staff sign-in.",
        demo: true,
      },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth unavailable." }, { status: 503 });
  }

  const { email, password } = parsed.data;
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
