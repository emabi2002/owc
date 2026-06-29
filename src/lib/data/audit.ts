/**
 * Audit logging service.
 *
 * Append-only record of security- and content-relevant events: create, update,
 * delete, approve, publish, submit, login, failed_login and role_change.
 * Writes use the service-role client so entries cannot be tampered with under
 * normal RLS; reads are restricted to staff.
 */
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuditAction } from "@/lib/supabase/types";
import type { AuditEntry } from "@/lib/data/types";
import { SEED_AUDIT_LOG } from "@/lib/db/seed";

export type AuditInput = {
  action: AuditAction;
  entity: string;
  entityId?: string;
  summary: string;
  actorId?: string;
  actorEmail?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
};

/** Records an audit event. No-op (console in dev) when Supabase isn't configured. */
export async function recordAudit(input: AuditInput): Promise<void> {
  const admin = createAdminSupabaseClient();
  if (!admin) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[audit:demo]", input.action, input.entity, input.summary);
    }
    return;
  }
  await admin.from("audit_logs").insert({
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId ?? null,
    summary: input.summary,
    actor_id: input.actorId ?? null,
    actor_email: input.actorEmail ?? null,
    metadata: (input.metadata ?? null) as never,
    ip_address: input.ip ?? null,
  });
}

const fmtTime = (iso: string) => iso.slice(0, 16).replace("T", " ");

/** Returns recent audit entries (staff only). Falls back to seed data. */
export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return SEED_AUDIT_LOG;

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return SEED_AUDIT_LOG;

  return data.map((r) => ({
    time: fmtTime(r.created_at),
    user: r.actor_email ?? "system",
    action: r.summary.split(":")[0] ?? r.action,
    target: r.summary,
    type: r.action,
  }));
}
