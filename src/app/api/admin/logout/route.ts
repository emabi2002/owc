import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/data/audit";
import { getClientIp } from "@/lib/security/rate-limit";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import {
  DEMO_MFA_COOKIE,
  DEMO_SESSION_COOKIE,
  recordDemoIdentityEvent,
  verifyDemoSessionToken,
} from "@/lib/auth/demo-identity";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  if (isDemonstrationIdentityMode()) {
    const token = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    const principal = token ? verifyDemoSessionToken(token) : null;
    if (principal) {
      recordDemoIdentityEvent("logout", principal);
      await recordAudit({
        action: "login",
        entity: "auth",
        summary: `Demonstration signed out: ${principal.email}`,
        actorId: principal.id,
        actorEmail: principal.email,
        ip,
      });
    }

    const response = NextResponse.json({ ok: true, demonstration: true });
    response.cookies.delete(DEMO_SESSION_COOKIE);
    response.cookies.delete(DEMO_MFA_COOKIE);
    return response;
  }

  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.auth.signOut();
    if (user) {
      await recordAudit({
        action: "login",
        entity: "auth",
        summary: `Signed out: ${user.email}`,
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        ip,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
