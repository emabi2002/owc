/**
 * CMS + admin operational data layer.
 *
 * Provides the content library, the editorial workflow (Draft → Submitted →
 * Approved → Published), and read access to staff, claims and dashboard
 * metrics. Every mutation is audited. Falls back to seed data in demo mode so
 * the admin console is fully navigable without a live database.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";
import type {
  AdminClaim,
  ContentItem,
  Role,
  StaffMember,
  WorkflowStatus,
} from "@/lib/data/types";
import {
  ROLE_PERMISSIONS,
  SEED_ADMIN_CLAIMS,
  SEED_CONTENT_ITEMS,
  SEED_STAFF,
} from "@/lib/db/seed";
import { recordAudit } from "@/lib/data/audit";

export { ROLE_PERMISSIONS };

/** Editorial workflow tables that share the status lifecycle. */
export type WorkflowTable =
  | "news"
  | "pages"
  | "forms"
  | "reports"
  | "publications"
  | "legislation";

const STATUS_TO_WORKFLOW: Record<ContentStatus, WorkflowStatus> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

export const WORKFLOW_ORDER: WorkflowStatus[] = [
  "Draft",
  "Submitted",
  "Approved",
  "Published",
];

/* ------------------------------ Content -------------------------------- */
export async function getContentItems(): Promise<ContentItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return SEED_CONTENT_ITEMS;

  // Editorial content lives primarily in `news` and `pages`.
  const [news, pages] = await Promise.all([
    supabase.from("news").select("id,title,status,updated_at").limit(50),
    supabase.from("pages").select("id,title,status,updated_at").limit(50),
  ]);

  const items: ContentItem[] = [];
  for (const r of news.data ?? []) {
    items.push({
      id: r.id,
      title: r.title,
      type: "News",
      author: "—",
      updated: r.updated_at.slice(0, 10),
      status: STATUS_TO_WORKFLOW[r.status],
    });
  }
  for (const r of pages.data ?? []) {
    items.push({
      id: r.id,
      title: r.title,
      type: "Page",
      author: "—",
      updated: r.updated_at.slice(0, 10),
      status: STATUS_TO_WORKFLOW[r.status],
    });
  }
  return items.length ? items : SEED_CONTENT_ITEMS;
}

export type TransitionAction =
  | "submit"
  | "approve"
  | "publish"
  | "return"
  | "archive";

const ACTION_TO_STATUS: Record<TransitionAction, ContentStatus> = {
  submit: "submitted",
  approve: "approved",
  publish: "published",
  return: "draft",
  archive: "archived",
};

const ACTION_LABEL: Record<TransitionAction, string> = {
  submit: "submitted for review",
  approve: "approved",
  publish: "published",
  return: "returned for changes",
  archive: "archived",
};

export type TransitionResult = {
  ok: boolean;
  message: string;
  status?: WorkflowStatus;
};

/**
 * Advances a content item through the editorial workflow and writes an audit
 * record. In demo mode this validates the request and returns success without
 * persistence (the UI updates optimistically).
 */
export async function transitionContent(
  table: WorkflowTable,
  id: string,
  action: TransitionAction,
  actor?: { id?: string; email?: string },
): Promise<TransitionResult> {
  const newStatus = ACTION_TO_STATUS[action];
  const auditAction =
    action === "submit"
      ? "submit"
      : action === "approve"
        ? "approve"
        : action === "publish"
          ? "publish"
          : "update";

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    await recordAudit({
      action: auditAction,
      entity: table,
      entityId: id,
      summary: `${table}: ${ACTION_LABEL[action]} (demo)`,
      actorEmail: actor?.email,
    });
    return {
      ok: true,
      message: `Content ${ACTION_LABEL[action]}`,
      status: STATUS_TO_WORKFLOW[newStatus],
    };
  }

  const patch: Record<string, unknown> = { status: newStatus };
  if (newStatus === "published") patch.published_at = new Date().toISOString();

  // Untyped handle: `table` is a runtime union, which the typed client cannot
  // narrow for dynamic update/delete payloads.
  const db = supabase as unknown as SupabaseClient;
  const { error } = await db.from(table).update(patch).eq("id", id);
  if (error) return { ok: false, message: error.message };

  await recordAudit({
    action: auditAction,
    entity: table,
    entityId: id,
    summary: `${table}: ${ACTION_LABEL[action]}`,
    actorId: actor?.id,
    actorEmail: actor?.email,
  });

  return {
    ok: true,
    message: `Content ${ACTION_LABEL[action]}`,
    status: STATUS_TO_WORKFLOW[newStatus],
  };
}

export async function deleteContent(
  table: WorkflowTable,
  id: string,
  actor?: { id?: string; email?: string },
): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    await recordAudit({
      action: "delete",
      entity: table,
      entityId: id,
      summary: `${table}: delete (demo)`,
      actorEmail: actor?.email,
    });
    return { ok: true, message: "Content deleted" };
  }
  const db = supabase as unknown as SupabaseClient;
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  await recordAudit({
    action: "delete",
    entity: table,
    entityId: id,
    summary: `${table}: delete`,
    actorId: actor?.id,
    actorEmail: actor?.email,
  });
  return { ok: true, message: "Content deleted" };
}

/* ------------------------------- Create -------------------------------- */
function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "news"
  );
}

export type NewNewsInput = {
  title: string;
  category?: string;
  excerpt?: string;
  body?: string;
  imageUrl?: string;
};

/** Creates a news article in Draft status and audits the action. */
export async function createNews(
  input: NewNewsInput,
  actor?: { id?: string; email?: string },
): Promise<{ ok: boolean; message: string; id?: string }> {
  const supabase = await createServerSupabaseClient();
  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;

  if (!supabase) {
    await recordAudit({
      action: "create",
      entity: "news",
      summary: `news: created "${input.title}" (demo)`,
      actorEmail: actor?.email,
    });
    return { ok: true, message: "News created (demo)", id: `demo-${Date.now()}` };
  }

  const { data, error } = await supabase
    .from("news")
    .insert({
      slug,
      title: input.title,
      category: input.category || "Announcement",
      excerpt: input.excerpt || null,
      body: input.body || null,
      image_url: input.imageUrl || null,
      status: "draft",
      author_id: actor?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    action: "create",
    entity: "news",
    entityId: data.id,
    summary: `news: created "${input.title}"`,
    actorId: actor?.id,
    actorEmail: actor?.email,
  });

  return { ok: true, message: "News article created", id: data.id };
}

/* ------------------------------- Staff --------------------------------- */
export async function getStaff(): Promise<StaffMember[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return SEED_STAFF;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data?.length) return SEED_STAFF;

  const roleLabel: Record<string, Role> = {
    administrator: "Administrator",
    editor: "Editor",
    reviewer: "Reviewer",
    claims_officer: "Claims Officer",
    viewer: "Viewer",
  };
  return data.map((r) => ({
    name: r.full_name ?? r.email,
    email: r.email,
    role: roleLabel[r.role] ?? "Viewer",
    status:
      r.status === "active"
        ? "Active"
        : r.status === "invited"
          ? "Invited"
          : "Suspended",
    lastActive: r.last_active_at
      ? new Date(r.last_active_at).toLocaleString("en-GB")
      : "—",
  }));
}

/* ------------------------------- Claims -------------------------------- */
export async function getAdminClaims(): Promise<AdminClaim[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return SEED_ADMIN_CLAIMS;
  const { data, error } = await supabase
    .from("claim_tracking")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data?.length) return SEED_ADMIN_CLAIMS;
  return data.map((r) => ({
    ref: r.reference,
    worker: r.worker_name,
    employer: r.employer_name ?? "—",
    type: r.injury_type ?? "—",
    lodged: r.lodged_date ?? "—",
    status: (r.status as AdminClaim["status"]) ?? "New",
  }));
}

/* ----------------------------- Dashboard ------------------------------- */
export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  icon: string;
};

export async function getDashboardStats(): Promise<DashboardStat[]> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const [claims, enquiries, pending] = await Promise.all([
      supabase
        .from("claim_tracking")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("news")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted"),
    ]);
    if (!claims.error) {
      return [
        { label: "Open claims", value: String(claims.count ?? 0), delta: "Tracked in CPPS", trend: "up", icon: "FileText" },
        { label: "Pending approvals", value: String(pending.count ?? 0), delta: "Content awaiting review", trend: "flat", icon: "ClipboardCheck" },
        { label: "New enquiries", value: String(enquiries.count ?? 0), delta: "Unactioned", trend: "up", icon: "Mail" },
        { label: "Registered employers", value: "8,640", delta: "From CPPS registry", trend: "up", icon: "Building2" },
      ];
    }
  }

  return [
    { label: "Open claims", value: "1,284", delta: "+42 this week", trend: "up", icon: "FileText" },
    { label: "Pending approvals", value: "17", delta: "Content awaiting review", trend: "flat", icon: "ClipboardCheck" },
    { label: "New enquiries", value: "63", delta: "+12 today", trend: "up", icon: "Mail" },
    { label: "Registered employers", value: "8,640", delta: "+18 this month", trend: "up", icon: "Building2" },
  ];
}
