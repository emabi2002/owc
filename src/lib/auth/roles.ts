/**
 * Role-Based Access Control (OWASP A01 — broken access control).
 *
 * Staff roles map to a fixed permission matrix. Server actions, route handlers
 * and admin pages gate behaviour through `hasPermission`.
 */
import type { AppRole } from "@/lib/supabase/types";
import type { Role } from "@/lib/data/types";

export const ALL_ROLES: AppRole[] = [
  "administrator",
  "editor",
  "reviewer",
  "claims_officer",
  "assessment_officer",
  "finance_officer",
  "viewer",
];

/** snake_case DB role → display label. */
export const ROLE_LABELS: Record<AppRole, Role> = {
  administrator: "Administrator",
  editor: "Editor",
  reviewer: "Reviewer",
  claims_officer: "Claims Officer",
  assessment_officer: "Assessment Officer",
  finance_officer: "Finance / Payment Officer",
  viewer: "Viewer",
};

/** Display label → DB role. */
export const ROLE_VALUES: Record<Role, AppRole> = {
  Administrator: "administrator",
  Editor: "editor",
  Reviewer: "reviewer",
  "Claims Officer": "claims_officer",
  "Assessment Officer": "assessment_officer",
  "Finance / Payment Officer": "finance_officer",
  Viewer: "viewer",
};

export const PERMISSIONS = {
  "content.create": ["administrator", "editor"],
  "content.edit": ["administrator", "editor", "reviewer"],
  "content.submit": ["administrator", "editor"],
  "content.approve": ["administrator", "reviewer"],
  "content.publish": ["administrator", "reviewer"],
  "content.delete": ["administrator"],
  "claims.view": [
    "administrator",
    "claims_officer",
    "reviewer",
    "assessment_officer",
    "finance_officer",
  ],
  "claims.manage": ["administrator", "claims_officer"],
  "claims.assess": ["administrator", "assessment_officer"],
  "payments.manage": ["administrator", "finance_officer"],
  "evidence.view": ["administrator", "claims_officer", "assessment_officer"],
  "evidence.manage": ["administrator", "claims_officer"],
  "users.manage": ["administrator"],
  "audit.view": [
    "administrator",
    "editor",
    "reviewer",
    "claims_officer",
    "assessment_officer",
    "finance_officer",
    "viewer",
  ],
  "settings.manage": ["administrator"],
} as const satisfies Record<string, AppRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: AppRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly AppRole[]).includes(role);
}

export function isStaff(role: AppRole | null | undefined): boolean {
  return ALL_ROLES.includes(role as AppRole);
}
