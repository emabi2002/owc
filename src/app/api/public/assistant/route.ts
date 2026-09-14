import { NextRequest, NextResponse } from "next/server";
import { answerPublicAssistant } from "@/lib/ai/public-assistant";
import { loadPublicKnowledge } from "@/lib/ai/public-knowledge";
import { publicAssistantRequestSchema } from "@/lib/ai/public-validation";
import { createOpenAiCompatibleAdapter } from "@/lib/ai/openai-compatible-provider";
import { createReferenceAiAdapter } from "@/lib/ai/reference-provider";
import type { AiAdapter, AiProvider } from "@/lib/ai/types";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import { serverEnv } from "@/lib/env";
import { buildPublicEnquiryRoutingConfiguration } from "@/lib/enquiries/configuration";
import { routeEnquiry } from "@/lib/enquiries/routing";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

function configuredAi(): { provider: AiProvider; adapter?: AiAdapter } {
  if (serverEnv.aiProvider === "reference") {
    return { provider: "reference", adapter: createReferenceAiAdapter() };
  }
  if (
    serverEnv.aiProvider === "openai_compatible" &&
    serverEnv.aiApiUrl &&
    serverEnv.aiApiKey &&
    serverEnv.aiModel
  ) {
    return {
      provider: "openai_compatible",
      adapter: createOpenAiCompatibleAdapter({
        apiUrl: serverEnv.aiApiUrl,
        apiKey: serverEnv.aiApiKey,
        model: serverEnv.aiModel,
      }),
    };
  }
  return { provider: "disabled" };
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  const parsed = publicAssistantRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid public assistant request", issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const ip = getClientIp(request.headers);
  const limited = rateLimit(`public-ai:${ip}:${parsed.data.channel}`, 20, 60_000);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many assistant requests. Please try again shortly." },
      { status: 429, headers: { "Cache-Control": "no-store", ...rateLimitHeaders(limited) } },
    );
  }

  const knowledge = await loadPublicKnowledge();
  const result = await answerPublicAssistant({
    request: parsed.data,
    knowledge,
    ai: configuredAi(),
  });

  const demonstration = isDemonstrationIdentityMode();
  const route = result.referralSuggested
    ? routeEnquiry(
        { message: parsed.data.message },
        buildPublicEnquiryRoutingConfiguration({ demonstration }),
      )
    : null;

  return NextResponse.json(
    {
      ok: true,
      ...result,
      channel: parsed.data.channel,
      demonstration,
      referralPreview: route
        ? {
            category: route.category,
            priority: route.priority,
            escalation: route.escalation,
            routeId: route.destination.id,
            routeLabel: route.destination.label,
            fallbackUsed: route.fallbackUsed,
            requiresConfirmation: true,
          }
        : null,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        ...rateLimitHeaders(limited),
      },
    },
  );
}
