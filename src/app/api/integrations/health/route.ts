import { NextResponse } from "next/server";
import { listIntegrationServiceStateGateway } from "@/lib/integrations/persistent/gateway";
import { PersistentIntegrationError } from "@/lib/integrations/persistent/repository";
import {
  isSandboxEnabled,
  sandboxUnavailableResponse,
} from "@/lib/integrations/sandbox/http";

export async function GET() {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

  try {
    return NextResponse.json({
      services: await listIntegrationServiceStateGateway(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof PersistentIntegrationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
