import type { SupabaseClient } from "@supabase/supabase-js";
import { recordAudit } from "@/lib/data/audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildClaimNotification } from "./notifications";
import { deliverClaimNotification, type NotificationChannel } from "./notification-delivery";
import { planClaimTransition } from "./transition";
import {
  isClaimWorkflowStatus,
  type ClaimWorkflowStatus,
} from "./workflow";

export type ClaimTransitionServiceResult =
  | {
      ok: true;
      from: ClaimWorkflowStatus;
      to: ClaimWorkflowStatus;
      notificationStatus?: "sent" | "queued" | "failed" | "suppressed";
    }
  | { ok: false; status: number; message: string };

export async function transitionClaimStatus(input: {
  claimReference: string;
  targetStatus: ClaimWorkflowStatus;
  actor: { id?: string; email?: string };
}): Promise<ClaimTransitionServiceResult> {
  const adminClient = createAdminSupabaseClient();
  if (!adminClient) {
    return { ok: false, status: 503, message: "Claims database is not configured" };
  }
  const admin = adminClient as unknown as SupabaseClient;
  const claimReference = input.claimReference.trim().toUpperCase();

  const { data: claim, error: claimError } = await admin
    .from("claim_tracking")
    .select("reference,status,worker_name")
    .eq("reference", claimReference)
    .single();

  if (claimError || !claim) {
    return { ok: false, status: 404, message: "Claim not found" };
  }

  const current = String(claim.status ?? "New");
  if (!isClaimWorkflowStatus(current)) {
    return { ok: false, status: 409, message: "Claim has an unsupported workflow status" };
  }

  const plan = planClaimTransition(current, input.targetStatus);
  if (!plan.ok) {
    return { ok: false, status: 409, message: plan.reason };
  }

  const { error: updateError } = await admin
    .from("claim_tracking")
    .update({ status: plan.to, updated_at: new Date().toISOString() })
    .eq("reference", claimReference);

  if (updateError) {
    return { ok: false, status: 502, message: "Unable to update claim status" };
  }

  await recordAudit({
    action: "update",
    entity: "claim_tracking",
    entityId: claimReference,
    summary: `claim: ${claimReference} moved from ${plan.from} to ${plan.to}`,
    actorId: input.actor.id,
    actorEmail: input.actor.email,
    metadata: { from: plan.from, to: plan.to },
  });

  if (!plan.notificationEvent) {
    return { ok: true, from: plan.from, to: plan.to };
  }

  const notification = buildClaimNotification({
    event: plan.notificationEvent,
    claimReference,
    claimantName: claim.worker_name ? String(claim.worker_name) : undefined,
  });

  const { data: preference } = await admin
    .from("claim_notification_preferences")
    .select("email,mobile,preferred_channel,notifications_enabled")
    .eq("claim_reference", claimReference)
    .maybeSingle();

  const channel = (preference?.preferred_channel === "email" ? "email" : "sms") as NotificationChannel;
  const recipient = channel === "email" ? String(preference?.email ?? "") : String(preference?.mobile ?? "");
  const enabled = preference?.notifications_enabled !== false;

  const delivery = enabled
    ? await deliverClaimNotification({
        channel,
        recipient,
        subject: notification.subject,
        message: notification.message,
        claimReference,
        event: notification.event,
      })
    : { status: "suppressed" as const, error: "Notifications disabled" };

  await admin.from("claim_notifications").insert({
    claim_reference: claimReference,
    event: notification.event,
    channel,
    recipient: recipient || null,
    subject: notification.subject,
    message: notification.message,
    status: delivery.status,
    provider_message_id: delivery.providerMessageId ?? null,
    error_message: delivery.error ?? null,
    attempted_at: new Date().toISOString(),
    sent_at: delivery.status === "sent" ? new Date().toISOString() : null,
    created_by_id: input.actor.id ?? null,
  });

  return {
    ok: true,
    from: plan.from,
    to: plan.to,
    notificationStatus: delivery.status,
  };
}
