import { NextResponse } from "next/server";

/**
 * Reference CPPS HTTP endpoints are opt-in only. The same server-side flag that
 * authorizes the reference CPPS adapter also authorizes its UAT/demo façade.
 */
export function isReferenceCppsHttpEnabled(
  value: string | undefined = process.env.OWC_ENABLE_REFERENCE_ECOSYSTEM,
): boolean {
  return value === "true";
}

/** Hide reference-only routes completely when the reference ecosystem is off. */
export function referenceCppsUnavailableResponse() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

/**
 * Safe health metadata: deliberately states that this is synthetic, process-
 * local and not evidence of a production CPPS connection.
 */
export function referenceCppsHealthPayload() {
  return {
    source: "reference" as const,
    service: "cpps" as const,
    status: "available" as const,
    durable: false as const,
    productionConnected: false as const,
  };
}
