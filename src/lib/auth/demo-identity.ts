import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppRole } from "@/lib/supabase/types";

export type DemoPersonaId =
  | "administrator"
  | "claims-officer"
  | "assessment-officer"
  | "finance-officer"
  | "content-editor"
  | "employer-representative"
  | "claimant-worker";

export type DemoPrincipalType = "staff" | "employer" | "claimant";

export type DemoPrincipal = {
  id: string;
  personaId: DemoPersonaId;
  email: string;
  fullName: string;
  principalType: DemoPrincipalType;
  role: AppRole | null;
  active: boolean;
  mfaRequired: boolean;
  scopes: readonly string[];
};

export type DemoIdentityEvent = {
  id: string;
  at: string;
  event:
    | "login_succeeded"
    | "login_failed"
    | "mfa_challenged"
    | "mfa_succeeded"
    | "mfa_failed"
    | "logout"
    | "authorization_denied";
  personaId?: DemoPersonaId;
  actorEmail?: string;
};

export type DemoIdentityConfiguration = {
  sessionSecret: string;
  credential: string;
  mfaCode: string;
};

const DEMO_PRINCIPALS: readonly DemoPrincipal[] = [
  {
    id: "demo-staff-admin-001",
    personaId: "administrator",
    email: "admin.demo@owc.gov.pg",
    fullName: "Miriam Kila",
    principalType: "staff",
    role: "administrator",
    active: true,
    mfaRequired: true,
    scopes: ["admin:*"],
  },
  {
    id: "demo-staff-claims-001",
    personaId: "claims-officer",
    email: "claims.demo@owc.gov.pg",
    fullName: "Peter Wama",
    principalType: "staff",
    role: "claims_officer",
    active: true,
    mfaRequired: true,
    scopes: ["claims:view", "claims:manage", "evidence:review"],
  },
  {
    id: "demo-staff-assessment-001",
    personaId: "assessment-officer",
    email: "assessment.demo@owc.gov.pg",
    fullName: "Lucy Arore",
    principalType: "staff",
    role: "assessment_officer",
    active: true,
    mfaRequired: true,
    scopes: ["claims:view", "claims:assess"],
  },
  {
    id: "demo-staff-finance-001",
    personaId: "finance-officer",
    email: "finance.demo@owc.gov.pg",
    fullName: "John Kera",
    principalType: "staff",
    role: "finance_officer",
    active: true,
    mfaRequired: true,
    scopes: ["claims:view", "payments:manage"],
  },
  {
    id: "demo-staff-editor-001",
    personaId: "content-editor",
    email: "editor.demo@owc.gov.pg",
    fullName: "Anna Teme",
    principalType: "staff",
    role: "editor",
    active: true,
    mfaRequired: true,
    scopes: ["content:create", "content:edit", "content:submit"],
  },
  {
    id: "demo-employer-001",
    personaId: "employer-representative",
    email: "employer.demo@pacificengineering.example",
    fullName: "Daniel Pako",
    principalType: "employer",
    role: null,
    active: true,
    mfaRequired: false,
    scopes: ["employer:profile", "employer:claims:view", "employer:evidence:submit"],
  },
  {
    id: "demo-claimant-001",
    personaId: "claimant-worker",
    email: "claimant.demo@example.test",
    fullName: "Michael Kora",
    principalType: "claimant",
    role: null,
    active: true,
    mfaRequired: false,
    scopes: ["claimant:claims:lodge", "claimant:claims:view", "claimant:evidence:submit"],
  },
] as const;

const events: DemoIdentityEvent[] = [];
let eventSequence = 0;

export const DEMO_SESSION_COOKIE = "owc_demo_session";
export const DEMO_MFA_COOKIE = "owc_demo_mfa";

export const demoSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 8 * 60 * 60,
};

export const demoMfaCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 5 * 60,
};

export function isDemoIdentityConfigured(
  configuration: DemoIdentityConfiguration = {
    sessionSecret: process.env.OWC_DEMO_SESSION_SECRET ?? "",
    credential: process.env.OWC_DEMO_PASSWORD ?? "",
    mfaCode: process.env.OWC_DEMO_MFA_CODE ?? "",
  },
): boolean {
  return (
    configuration.sessionSecret.length >= 32 &&
    configuration.credential.length >= 12 &&
    /^\d{6}$/.test(configuration.mfaCode)
  );
}

export function listDemoPrincipals(): readonly DemoPrincipal[] {
  return DEMO_PRINCIPALS;
}

export function listDemoStaffPrincipals(): readonly DemoPrincipal[] {
  return DEMO_PRINCIPALS.filter((principal) => principal.principalType === "staff");
}

export function findDemoPrincipalByEmail(email: string): DemoPrincipal | null {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_PRINCIPALS.find(
      (principal) => principal.active && principal.email.toLowerCase() === normalized,
    ) ?? null
  );
}

export function findDemoPrincipalByPersonaId(
  personaId: string,
): DemoPrincipal | null {
  return (
    DEMO_PRINCIPALS.find(
      (principal) => principal.active && principal.personaId === personaId,
    ) ?? null
  );
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function authenticateDemoPrincipal(
  email: string,
  suppliedSecret: string,
  expectedSecret = process.env.OWC_DEMO_PASSWORD ?? "",
): DemoPrincipal | null {
  if (!expectedSecret || !suppliedSecret || !safeEqual(suppliedSecret, expectedSecret)) {
    return null;
  }
  return findDemoPrincipalByEmail(email);
}

export function verifyDemoMfaCode(
  suppliedCode: string,
  expectedCode = process.env.OWC_DEMO_MFA_CODE ?? "",
): boolean {
  return /^\d{6}$/.test(expectedCode) && safeEqual(suppliedCode, expectedCode);
}

type TokenPurpose = "session" | "mfa";

type TokenPayload = {
  version: 1;
  purpose: TokenPurpose;
  personaId: DemoPersonaId;
  expiresAt: number;
  mfaVerified: boolean;
};

function sessionSecret(override?: string): string {
  const value = override ?? process.env.OWC_DEMO_SESSION_SECRET ?? "";
  if (value.length < 32) {
    throw new Error("OWC_DEMO_SESSION_SECRET must contain at least 32 characters");
  }
  return value;
}

function signPayload(payload: TokenPayload, secretOverride?: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", sessionSecret(secretOverride))
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifyPayload(
  token: string,
  expectedPurpose: TokenPurpose,
  secretOverride?: string,
  now = Date.now(),
): { principal: DemoPrincipal; mfaVerified: boolean } | null {
  const [body, suppliedSignature, extra] = token.split(".");
  if (!body || !suppliedSignature || extra) return null;

  const expectedSignature = createHmac("sha256", sessionSecret(secretOverride))
    .update(body)
    .digest("base64url");
  if (!safeEqual(suppliedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (
      payload.version !== 1 ||
      payload.purpose !== expectedPurpose ||
      payload.expiresAt <= now
    ) {
      return null;
    }
    const principal = findDemoPrincipalByPersonaId(payload.personaId);
    if (!principal) return null;
    if (expectedPurpose === "session" && principal.mfaRequired && !payload.mfaVerified) {
      return null;
    }
    return { principal, mfaVerified: payload.mfaVerified };
  } catch {
    return null;
  }
}

export function issueDemoMfaToken(
  principal: DemoPrincipal,
  secretOverride?: string,
  now = Date.now(),
): string {
  return signPayload(
    {
      version: 1,
      purpose: "mfa",
      personaId: principal.personaId,
      expiresAt: now + 5 * 60_000,
      mfaVerified: false,
    },
    secretOverride,
  );
}

export function verifyDemoMfaToken(
  token: string,
  secretOverride?: string,
  now = Date.now(),
): DemoPrincipal | null {
  return verifyPayload(token, "mfa", secretOverride, now)?.principal ?? null;
}

export function issueDemoSessionToken(
  principal: DemoPrincipal,
  secretOverride?: string,
  now = Date.now(),
): string {
  return signPayload(
    {
      version: 1,
      purpose: "session",
      personaId: principal.personaId,
      expiresAt: now + 8 * 60 * 60_000,
      mfaVerified: true,
    },
    secretOverride,
  );
}

export function verifyDemoSessionToken(
  token: string,
  secretOverride?: string,
  now = Date.now(),
): DemoPrincipal | null {
  return verifyPayload(token, "session", secretOverride, now)?.principal ?? null;
}

export function recordDemoIdentityEvent(
  event: DemoIdentityEvent["event"],
  principal?: Pick<DemoPrincipal, "personaId" | "email">,
): DemoIdentityEvent {
  const entry: DemoIdentityEvent = {
    id: `demo-auth-${String(++eventSequence).padStart(6, "0")}`,
    at: new Date().toISOString(),
    event,
    personaId: principal?.personaId,
    actorEmail: principal?.email,
  };
  events.unshift(entry);
  if (events.length > 100) events.length = 100;
  return entry;
}

export function listDemoIdentityEvents(): readonly DemoIdentityEvent[] {
  return events;
}

export function resetDemoIdentityEvents(): void {
  events.length = 0;
  eventSequence = 0;
}
