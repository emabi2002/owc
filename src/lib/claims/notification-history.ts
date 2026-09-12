import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ClaimNotificationHistoryItem = {
  id: string;
  event: string;
  channel: "Email" | "SMS";
  recipient: string;
  subject: string;
  status: "Queued" | "Sent" | "Failed" | "Suppressed";
  createdAt: string;
};

export function mapNotificationRow(row: Record<string, unknown>): ClaimNotificationHistoryItem {
  const status = String(row.status ?? "queued");
  const statusLabel: ClaimNotificationHistoryItem["status"] =
    status === "sent"
      ? "Sent"
      : status === "failed"
        ? "Failed"
        : status === "suppressed"
          ? "Suppressed"
          : "Queued";

  return {
    id: String(row.id),
    event: String(row.event ?? "UPDATE"),
    channel: row.channel === "email" ? "Email" : "SMS",
    recipient: String(row.recipient ?? "—"),
    subject: String(row.subject ?? "OWC claim update"),
    status: statusLabel,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function getClaimNotificationHistory(
  claimReference: string,
): Promise<ClaimNotificationHistoryItem[]> {
  const client = await createServerSupabaseClient();
  if (!client) return [];

  const db = client as unknown as SupabaseClient;
  const { data, error } = await db
    .from("claim_notifications")
    .select("id,event,channel,recipient,subject,status,created_at")
    .eq("claim_reference", claimReference)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data ?? []).map((row) => mapNotificationRow(row as Record<string, unknown>));
}
