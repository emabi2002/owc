import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasPermission } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";
import { claimNotificationPreferenceSchema } from "@/lib/claims/notification-preferences";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "claims.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = claimNotificationPreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const adminClient = createAdminSupabaseClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Claims database is not configured" },
      { status: 503 },
    );
  }
  const admin = adminClient as unknown as SupabaseClient;

  const { ref } = await params;
  const claimReference = decodeURIComponent(ref).trim().toUpperCase();
  const value = parsed.data;

  const { error } = await admin.from("claim_notification_preferences").upsert(
    {
      claim_reference: claimReference,
      email: value.email || null,
      mobile: value.mobile || null,
      preferred_channel: value.preferredChannel,
      notifications_enabled: value.enabled,
    },
    { onConflict: "claim_reference" },
  );

  if (error) {
    return NextResponse.json(
      { error: "Unable to save notification preferences" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, claimReference, ...value });
}
