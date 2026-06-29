/**
 * Server-side session helpers.
 *
 * `getSessionUser` returns the authenticated staff member (with role) from
 * Supabase Auth. In demo mode (no Supabase configured) it returns a synthetic
 * Administrator so the console remains demonstrable; the login form itself only
 * ever authenticates against Supabase — there is no fake credential check.
 */
import { redirect } from "next/navigation";
import { isSupabaseConfigured, serverEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";
import { hasPermission, type Permission } from "@/lib/auth/roles";

/** Emails that should always be treated as Administrator (bootstrap). */
function bootstrapAdmins(): string[] {
  return serverEnv.bootstrapAdminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  mfaEnabled: boolean;
  demo: boolean;
};

const DEMO_USER: SessionUser = {
  id: "demo-admin",
  email: "l.aila@owc.gov.pg",
  fullName: "Lawrence Aila",
  role: "administrator",
  mfaEnabled: true,
  demo: true,
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return DEMO_USER;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return DEMO_USER;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? "";
  // Bootstrap elevation: ensures the seeded administrator can manage the
  // console even before the `profiles` table/trigger has been provisioned.
  const isBootstrap = bootstrapAdmins().includes(email.toLowerCase());

  return {
    id: user.id,
    email,
    fullName: profile?.full_name ?? email ?? "OWC Staff",
    role: isBootstrap ? "administrator" : ((profile?.role as AppRole) ?? "viewer"),
    mfaEnabled: profile?.mfa_enabled ?? false,
    demo: false,
  };
}

/** Redirects to login when unauthenticated; returns the user otherwise. */
export async function requireUser(redirectTo = "/admin"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/admin/login?redirect=${encodeURIComponent(redirectTo)}`);
  return user;
}

/** Ensures the current user holds a permission; redirects to /admin if not. */
export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasPermission(user.role, permission)) redirect("/admin");
  return user;
}
