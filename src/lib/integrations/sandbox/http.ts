import { NextResponse } from "next/server";
import type { z } from "zod";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { parseSandboxBody } from "./validation";

export function isSandboxEnabled(
  value: string | undefined = process.env.OWC_ENABLE_SANDBOX,
): boolean {
  return value === "true";
}

export function sandboxUnavailableResponse() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function handleSandboxPost<T>(
  request: Request,
  options: {
    rateLimitKey: string;
    schema: z.ZodType<T>;
    execute: (input: T) => unknown;
    limit?: number;
  },
) {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();

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

  return NextResponse.json(options.execute(parsed.data));
}
