import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import { isSandboxEnabled, sandboxUnavailableResponse } from "@/lib/integrations/sandbox/http";
import {
  listSandboxServiceStatuses,
  resetSandboxServiceStatuses,
  setSandboxServiceStatus,
} from "@/lib/integrations/sandbox/state";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set"),
    service: z.enum([
      "nid",
      "ipa",
      "irc",
      "employer",
      "medical",
      "insurance",
      "bank",
      "notifications",
    ]),
    status: z.enum(["online", "degraded", "offline"]),
  }),
  z.object({ action: z.literal("reset") }),
]);

async function authorize() {
  const user = await getSessionUser();
  return user && hasPermission(user.role, "settings.manage") ? user : null;
}

export async function GET() {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ services: listSandboxServiceStatuses() });
}

export async function POST(request: Request) {
  if (!isSandboxEnabled()) return sandboxUnavailableResponse();
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.action === "reset") {
    resetSandboxServiceStatuses();
  } else {
    setSandboxServiceStatus(parsed.data.service, parsed.data.status);
  }

  return NextResponse.json({ services: listSandboxServiceStatuses() });
}
