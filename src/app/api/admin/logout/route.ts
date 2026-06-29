import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/data/audit";
import { getClientIp } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
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
