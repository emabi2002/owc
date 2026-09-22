import { NextResponse } from "next/server";
import type { z } from "zod";
import { serverEnv } from "@/lib/env";
import { PersistentIntegrationError } from "@/lib/integrations/persistent/repository";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { makeCorrelationId } from "./service";
import { getSandboxServiceStatus } from "./state";
import type { SandboxServiceName } from "./types";
import { parseSandboxBody } from "./validation";

export function isSandboxEnabled(
  value: string | undefined = process.env.OWC_ENABLE_SANDBOX,
): boolean {
  return value === "true";
}

export function sandboxUnavailableResponse() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function sandboxServiceUnavailableResponse(service: SandboxServiceName) {
  return NextResponse.json(
    {
      source: "sandbox",
      service,
      status: "unavailable",
      correlationId: makeCorrelationId(),
      timestamp: new Date().toISOString(),
      error: "Simulated service unavailable",
    },
    { status: 503 },
  );
}

function inferService(rateLimitKey: string): SandboxServiceName {
  return rateLimitKey.split(":", 1)[0] as SandboxServiceName;
}

export async function handleSandboxPost<T>(
  request: Request,
  options: {
    service?: SandboxServiceName;
    rateLimitKey: string;
    schema: z.ZodType<T>;
    execute: (input: T) => unknown | Promise<unknown>;
    limit?: number;
  },
) {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

  const service = options.service ?? inferService(options.rateLimitKey);
  if (!serverEnv.persistentDemonstration && getSandboxServiceStatus(service) !== "online") {
    return sandboxServiceUnavailableResponse(service);
  }

  const ip = getClientIp(request.headers);
  const limited = rateLimit(
    `sandbox:${options.rateLimitKey}:${ip}`,
    options.limit ?? 60,
  );
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSandboxBody(options.schema, body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.issues },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await options.execute(parsed.data));
  } catch (error) {
    if (error instanceof PersistentIntegrationError) {
      return NextResponse.json(
        {
          source: "persistent_demo",
          service,
          status: "unavailable",
          correlationId: makeCorrelationId(),
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        { status: error.status },
      );
    }
    throw error;
  }
}
