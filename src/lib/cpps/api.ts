/**
 * CPPS API client (server-only).
 *
 * Live CPPS remains authoritative whenever configured. In controlled demo/UAT
 * environments, an explicitly enabled reference CPPS can exercise the same OWC
 * workflow without claiming live access. If neither backend is available, CPPS
 * operations fail closed instead of inventing ad-hoc mock data.
 *
 * SECURITY: reads server-only secrets — never import this into client code.
 */
import {
  isCppsConfigured,
  isReferenceEcosystemEnabled,
  serverEnv,
} from "@/lib/env";
import { selectCppsBackend } from "@/lib/cpps/backend-mode";
import { toCppsClaimStatus } from "@/lib/cpps/reference/contract";
import { referenceCppsService } from "@/lib/cpps/reference/runtime";
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

function backendMode() {
  return selectCppsBackend({
    liveConfigured: isCppsConfigured,
    referenceEnabled: isReferenceEcosystemEnabled,
  });
}

function unavailable<T>(): CppsResult<T> {
  return {
    ok: false,
    source: "unavailable",
    error:
      "CPPS is not configured for this environment. Configure the live CPPS or explicitly enable the reference ecosystem for controlled demo/UAT use.",
  };
}

/* ----------------------------------------------------------------------- */
/*  Service functions                                                       */
/* ----------------------------------------------------------------------- */

export async function getClaimStatus(
  reference: string,
  surname?: string,
): Promise<CppsResult<CppsClaimStatus>> {
  const mode = backendMode();
  if (mode === "live") {
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

  if (mode === "reference") {
    const claim = referenceCppsService.getClaim(reference);
    if (!claim) return { ok: false, error: "Claim not found", source: "reference" };
    return { ok: true, data: toCppsClaimStatus(claim), source: "reference" };
  }

  return unavailable();
}

export async function checkEmployerRegistration(
  query: string,
): Promise<CppsResult<CppsEmployerCheck>> {
  const mode = backendMode();
  if (mode === "live") {
    try {
      const data = await cppsRest<CppsEmployerCheck>(
        `/employers/verify?q=${encodeURIComponent(query)}`,
      );
      return { ok: true, data, source: "cpps" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, source: "cpps" };
    }
  }

  if (mode === "reference") {
    return {
      ok: true,
      source: "reference",
      data: referenceCppsService.verifyEmployer(query),
    };
  }

  return unavailable();
}

export async function submitClaimLodgement(
  input: CppsLodgeInput,
): Promise<CppsResult<CppsLodgeResult>> {
  const mode = backendMode();
  if (mode === "live") {
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

  if (mode === "reference") {
    const claim = referenceCppsService.registerClaim(input);
    return {
      ok: true,
      source: "reference",
      data: { reference: claim.reference, receivedAt: claim.receivedAt },
    };
  }

  return unavailable();
}

export async function reportWorkplaceInjury(
  input: CppsInjuryReportInput,
): Promise<CppsResult<CppsInjuryReportResult>> {
  const mode = backendMode();
  if (mode === "live") {
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

  if (mode === "reference") {
    return {
      ok: true,
      source: "reference",
      data: referenceCppsService.receiveInjuryReport(input),
    };
  }

  return unavailable();
}

export async function submitEnquiry(
  input: CppsEnquiryInput,
): Promise<CppsResult<CppsEnquiryResult>> {
  const mode = backendMode();
  if (mode === "live") {
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

  if (mode === "reference") {
    return {
      ok: true,
      source: "reference",
      data: referenceCppsService.receiveEnquiry(input),
    };
  }

  return unavailable();
}
