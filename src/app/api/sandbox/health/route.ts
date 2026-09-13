import { NextResponse } from "next/server";
import { isSandboxEnabled, sandboxUnavailableResponse } from "@/lib/integrations/sandbox/http";
import { listSandboxServiceStatuses } from "@/lib/integrations/sandbox/state";

export async function GET() {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

  return NextResponse.json({
    services: listSandboxServiceStatuses(),
    timestamp: new Date().toISOString(),
  });
}
