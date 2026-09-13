import { NextResponse } from "next/server";
import { runWorkerClaimDemo } from "@/lib/integrations/sandbox/demo-scenario";
import {
  isSandboxEnabled,
  sandboxUnavailableResponse,
} from "@/lib/integrations/sandbox/http";
import {
  claimProcessSchema,
  parseSandboxBody,
} from "@/lib/integrations/sandbox/validation";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

  const ip = getClientIp(request.headers);
  const limited = rateLimit(`integrations:claim:${ip}`, 20);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const hasInput =
    body !== null &&
    typeof body === "object" &&
    Object.keys(body as Record<string, unknown>).length > 0;

  if (!hasInput) {
    return NextResponse.json(runWorkerClaimDemo());
  }

  const parsed = parseSandboxBody(claimProcessSchema, body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Invalid claim processing request", issues: parsed.issues },
      { status: 400 },
    );
  }

  return NextResponse.json(runWorkerClaimDemo(parsed.data));
}
