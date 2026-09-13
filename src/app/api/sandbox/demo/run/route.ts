import { NextResponse } from "next/server";
import { runWorkerClaimDemo } from "@/lib/integrations/sandbox/demo-scenario";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import {
  isSandboxEnabled,
  sandboxUnavailableResponse,
} from "@/lib/integrations/sandbox/http";

export async function POST(request: Request) {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

  const ip = getClientIp(request.headers);
  const limited = rateLimit(`sandbox:demo:${ip}`, 20);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  return NextResponse.json(runWorkerClaimDemo());
}
