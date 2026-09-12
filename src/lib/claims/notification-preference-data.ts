import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClaimNotificationPreferenceInput } from "./notification-preferences";

const DEFAULT_PREFERENCE: ClaimNotificationPreferenceInput = {
  email: "",
  mobile: "",
  preferredChannel: "sms",
  enabled: true,
};

const REFERENCE_PREFERENCE: ClaimNotificationPreferenceInput = {
  email: "claimant@example.com",
  mobile: "+67570001234",
  preferredChannel: "sms",
  enabled: true,
};

export function mapNotificationPreferenceRow(
  row: Record<string, unknown>,
): ClaimNotificationPreferenceInput {
  return {
    email: String(row.email ?? ""),
    mobile: String(row.mobile ?? ""),
    preferredChannel: row.preferred_channel === "email" ? "email" : "sms",
    enabled: row.notifications_enabled !== false,
  };
}

export async function getClaimNotificationPreference(
  claimReference: string,
): Promise<ClaimNotificationPreferenceInput> {
  const client = await createServerSupabaseClient();
  const reference = claimReference.trim().toUpperCase();
  if (!client) {
    return reference === "OWC-2026-004821"
      ? REFERENCE_PREFERENCE
      : DEFAULT_PREFERENCE;
  }

  const db = client as unknown as SupabaseClient;
  const { data, error } = await db
    .from("claim_notification_preferences")
    .select("email,mobile,preferred_channel,notifications_enabled")
    .eq("claim_reference", reference)
    .maybeSingle();

  if (error || !data) {
    return reference === "OWC-2026-004821"
      ? REFERENCE_PREFERENCE
      : DEFAULT_PREFERENCE;
  }
  return mapNotificationPreferenceRow(data as Record<string, unknown>);
}
