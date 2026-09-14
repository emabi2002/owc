/**
 * Server-side session helpers.
 *
 * The admin console supports two explicit identity providers:
 * - `live`: Supabase Auth + the OWC profile table.
 * - `demonstration`: the signed OWC reference identity session.
 *
 * There is no implicit administrator fallback when live authentication is not
 * configured. A missing live provider therefore fails closed.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, serverEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";
import { hasPermission, type Permission } from "@/lib/auth/roles";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import {
  DEMO_SESSION_COOKIE,
  recordDemoIdentityEvent,
  verifyDemoSessionToken,
  type DemoPersonaId,
} from "@/lib/auth/demo-identity";

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

async function getDemonstrationSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(DEMO_SESSION_COOKIE)?.value;
  if (!token) return null;

  const principal = verifyDemoSessionToken(token);
  if (!principal || principal.principalType !== "staff" || !principal.role) {
    return null;
  }

  return {
    id: principal.id,
    email: principal.email,
    fullName: principal.fullName,
    role: principal.role,
    mfaEnabled: principal.mfaRequired,
    demo: true,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemonstrationIdentityMode()) {
    return getDemonstrationSessionUser();
  }

  if (!isSupabaseConfigured) return null;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.status !== "active") return null;

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
export async function requireUser(
  redirectTo = "/admin",
  loginPath = "/admin/login",
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`${loginPath}?redirect=${encodeURIComponent(redirectTo)}`);
  return user;
}

function demoPersonaForRole(role: AppRole): DemoPersonaId {
  switch (role) {
    case "administrator":
      return "administrator";
    case "claims_officer":
      return "claims-officer";
    case "assessment_officer":
      return "assessment-officer";
    case "finance_officer":
      return "finance-officer";
    case "management":
      return "management-executive";
    default:
      return "content-editor";
  }
}

/** Ensures the current user holds a permission; redirects when not authorised. */
export async function requirePermission(
  permission: Permission,
  options: {
    redirectTo?: string;
    loginPath?: string;
    deniedPath?: string;
  } = {},
): Promise<SessionUser> {
  const user = await requireUser(
    options.redirectTo ?? "/admin",
    options.loginPath ?? "/admin/login",
  );
  if (!hasPermission(user.role, permission)) {
    if (user.demo) {
      recordDemoIdentityEvent("authorization_denied", {
        personaId: demoPersonaForRole(user.role),
        email: user.email,
      });
    }
    redirect(options.deniedPath ?? "/admin");
  }
  return user;
}
