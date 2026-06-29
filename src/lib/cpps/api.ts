/**
 * CPPS API client (server-only).
 *
 * Supports both REST and GraphQL transports and exposes high-level service
 * functions for the public portal:
 *   - getClaimStatus
 *   - checkEmployerRegistration
 *   - submitClaimLodgement
 *   - reportWorkplaceInjury
 *   - submitEnquiry
 *
 * When CPPS is not configured (no CPPS_API_BASE_URL / CPPS_GRAPHQL_ENDPOINT)
 * the functions return realistic mock data so the portal is fully demonstrable.
 *
 * SECURITY: reads server-only secrets — never import this into client code.
 */
import { isCppsConfigured, serverEnv } from "@/lib/env";
import { SEED_CLAIM } from "@/lib/db/seed";
import type {
  CppsClaimStatus,
  CppsEmployerCheck,
  CppsEnquiryInput,
  CppsEnquiryResult,
  CppsInjuryReportInput,
  CppsInjuryReportResult,
  CppsLodgeInput,
  CppsLodgeResult,
  CppsResult,
} from "@/lib/cpps/types";

const TIMEOUT_MS = 10_000;

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serverEnv.cppsApiKey}`,
    "X-API-Key": serverEnv.cppsApiKey,
  };
}

async function withTimeout(input: RequestInfo, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Generic REST call against the CPPS base URL. */
async function cppsRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await withTimeout(`${serverEnv.cppsApiBaseUrl}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`CPPS REST ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Generic GraphQL call against the CPPS GraphQL endpoint. */
export async function cppsGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!serverEnv.cppsGraphqlEndpoint) {
    throw new Error("CPPS GraphQL endpoint not configured");
  }
  const res = await withTimeout(serverEnv.cppsGraphqlEndpoint, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`CPPS GraphQL ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

const newReference = (prefix = "OWC") =>
  `${prefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;

/* ----------------------------------------------------------------------- */
/*  Service functions                                                       */
/* ----------------------------------------------------------------------- */

export async function getClaimStatus(
  reference: string,
  surname?: string,
): Promise<CppsResult<CppsClaimStatus>> {
  if (isCppsConfigured) {
    try {
      const data = await cppsRest<CppsClaimStatus>(
        `/claims/${encodeURIComponent(reference)}/status`,
        {
          method: "GET",
          headers: surname ? { "X-Worker-Surname": surname } : undefined,
        },
      );
      return { ok: true, data, source: "cpps" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, source: "cpps" };
    }
  }

  // Mock: match the seed claim reference.
  if (reference.trim().toUpperCase() === SEED_CLAIM.reference.toUpperCase()) {
    return { ok: true, data: { ...SEED_CLAIM }, source: "mock" };
  }
  return { ok: false, error: "Claim not found", source: "mock" };
}

export async function checkEmployerRegistration(
  query: string,
): Promise<CppsResult<CppsEmployerCheck>> {
  if (isCppsConfigured) {
    try {
      const data = await cppsRest<CppsEmployerCheck>(
        `/employers/verify?q=${encodeURIComponent(query)}`,
      );
      return { ok: true, data, source: "cpps" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, source: "cpps" };
    }
  }

  const registered = query.trim().length > 2;
  return {
    ok: true,
    source: "mock",
    data: registered
      ? {
          registered: true,
          name: query.trim(),
          registrationNo: `EMP-${Math.floor(10000 + Math.random() * 89999)}`,
          policyExpiry: "2026-07-31",
          status: "Compliant",
        }
      : { registered: false, status: "Unknown" },
  };
}

export async function submitClaimLodgement(
  input: CppsLodgeInput,
): Promise<CppsResult<CppsLodgeResult>> {
  if (isCppsConfigured) {
    try {
      const data = await cppsRest<CppsLodgeResult>("/claims", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return { ok: true, data, source: "cpps" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, source: "cpps" };
    }
  }
  return {
    ok: true,
    source: "mock",
    data: { reference: newReference(), receivedAt: new Date().toISOString() },
  };
}

export async function reportWorkplaceInjury(
  input: CppsInjuryReportInput,
): Promise<CppsResult<CppsInjuryReportResult>> {
  if (isCppsConfigured) {
    try {
      const data = await cppsRest<CppsInjuryReportResult>("/injuries", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return { ok: true, data, source: "cpps" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, source: "cpps" };
    }
  }
  return {
    ok: true,
    source: "mock",
    data: {
      reference: newReference("INJ"),
      receivedAt: new Date().toISOString(),
    },
  };
}

export async function submitEnquiry(
  input: CppsEnquiryInput,
): Promise<CppsResult<CppsEnquiryResult>> {
  if (isCppsConfigured) {
    try {
      const data = await cppsRest<CppsEnquiryResult>("/enquiries", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return { ok: true, data, source: "cpps" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, source: "cpps" };
    }
  }
  return {
    ok: true,
    source: "mock",
    data: {
      reference: newReference("ENQ"),
      receivedAt: new Date().toISOString(),
    },
  };
}
