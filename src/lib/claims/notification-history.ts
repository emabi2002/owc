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

const REFERENCE_HISTORY: ClaimNotificationHistoryItem[] = [
  {
    id: "msg-004821-3",
    event: "ASSESSMENT_STARTED",
    channel: "SMS",
    recipient: "+67570001234",
    subject: "OWC claim OWC-2026-004821 assessment started",
    status: "Sent",
    createdAt: "2026-04-20T01:20:00Z",
  },
  {
    id: "msg-004821-2",
    event: "DOCUMENT_REQUIRED",
    channel: "Email",
    recipient: "claimant@example.com",
    subject: "OWC claim OWC-2026-004821 requires additional information",
    status: "Sent",
    createdAt: "2026-04-19T04:10:00Z",
  },
  {
    id: "msg-004821-1",
    event: "CLAIM_RECEIVED",
    channel: "SMS",
    recipient: "+67570001234",
    subject: "OWC claim OWC-2026-004821 received",
    status: "Sent",
    createdAt: "2026-04-18T03:16:00Z",
  },
];

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

function referenceHistory(claimReference: string) {
  return claimReference === "OWC-2026-004821" ? REFERENCE_HISTORY : [];
}

export async function getClaimNotificationHistory(
  claimReference: string,
): Promise<ClaimNotificationHistoryItem[]> {
  const client = await createServerSupabaseClient();
  if (!client) return referenceHistory(claimReference);

  const db = client as unknown as SupabaseClient;
  const { data, error } = await db
    .from("claim_notifications")
    .select("id,event,channel,recipient,subject,status,created_at")
    .eq("claim_reference", claimReference)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) return referenceHistory(claimReference);
  return data.map((row) => mapNotificationRow(row as Record<string, unknown>));
}
