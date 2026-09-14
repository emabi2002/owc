import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { LiveEnquiryWriter } from "./persistence";
import type { EnquiryNotificationStatus, PersistedEnquiryRecord } from "./types";

export function createLiveEnquiryWriter(): LiveEnquiryWriter | null {
  const db = createAdminSupabaseClient();
  if (!db) return null;

  return async (record: PersistedEnquiryRecord) => {
    const { data, error } = await db
      .from("enquiries")
      .insert({
        reference: record.reference,
        name: record.name,
        email: record.email,
        phone: record.phone,
        category: record.category,
        subject: record.subject,
        message: record.message,
        status: record.status,
        source_channel: record.sourceChannel,
        language: record.language,
        linked_claim_reference: record.linkedClaimReference,
        ai_summary: record.aiSummary,
        route_destination: record.routeDestination,
        priority: record.priority,
        confirmed_at: record.confirmedAt,
        notification_status: record.notificationStatus,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Live enquiry persistence failed.");
    }

    return {
      ...record,
      id: data.id,
      productionConnected: true,
      synthetic: false,
    };
  };
}

export async function updateLiveEnquiryNotificationStatus(
  reference: string,
  notificationStatus: EnquiryNotificationStatus,
): Promise<boolean> {
  const db = createAdminSupabaseClient();
  if (!db) return false;

  const { error } = await db
    .from("enquiries")
    .update({ notification_status: notificationStatus })
    .eq("reference", reference);

  return !error;
}
