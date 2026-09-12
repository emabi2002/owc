import { NextResponse } from "next/server";
import { listIntegrationEvents } from "@/lib/integrations/sandbox/events";
import {
  isSandboxEnabled,
  sandboxUnavailableResponse,
} from "@/lib/integrations/sandbox/http";

export async function GET() {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

  return NextResponse.json({
    source: "sandbox",
    events: listIntegrationEvents(),
    timestamp: new Date().toISOString(),
  });
}
