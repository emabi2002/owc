import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import { serverEnv } from "@/lib/env";
import { recordAudit } from "@/lib/data/audit";
import { loadManagementReportingSource } from "@/lib/reporting/source";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { analyzeManagementQuestion } from "@/lib/ai/management-analyst";
import { createReferenceAiAdapter } from "@/lib/ai/reference-provider";
import { createOpenAiCompatibleAdapter } from "@/lib/ai/openai-compatible-provider";
import type { AiAdapter, AiProvider } from "@/lib/ai/types";

const questionSchema = z.object({
  question: z.string().trim().min(3).max(1000),
});

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
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!hasPermission(user.role, "reports.ai.query")) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const limited = rateLimit(`management-ai:${user.id}`, 10, 60_000);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many management AI requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  const parsed = questionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Question must contain between 3 and 1000 characters." },
      { status: 400 },
    );
  }

  const source = await loadManagementReportingSource({
    mode: isDemonstrationIdentityMode() ? "demonstration" : "live",
    liveReader: null,
  });
  if (!source.available) {
    return NextResponse.json(
      { error: source.reason ?? "Management reporting source unavailable" },
      { status: 503 },
    );
  }

  const ai = configuredAi();
  const result = await analyzeManagementQuestion({
    question: parsed.data.question,
    rows: source.rows,
    ai,
  });

  await recordAudit({
    action: "update",
    entity: "management_ai_analysis",
    entityId: result.analysisId,
    summary: result.ok
      ? "Management AI analysis completed"
      : "Management AI analysis unavailable or rejected",
    actorId: user.id,
    actorEmail: user.email,
    metadata: {
      analysisId: result.analysisId,
      report: result.request?.report ?? null,
      from: result.request?.from ?? null,
      to: result.request?.to ?? null,
      province: result.request?.province ?? null,
      employer: result.request?.employer ?? null,
      status: result.request?.status ?? null,
      recordCount: result.report?.recordCount ?? null,
      aiSource: result.aiSource ?? null,
      productionConnected: result.productionConnected ?? false,
      environment: source.environment,
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        analysisId: result.analysisId,
        error: result.error ?? "Management AI analysis unavailable",
        report: result.report ?? null,
      },
      { status: result.report ? 503 : 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      analysisId: result.analysisId,
      narrative: result.narrative,
      request: result.request,
      report: result.report,
      aiSource: result.aiSource,
      productionConnected: result.productionConnected,
      environment: source.environment,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        ...rateLimitHeaders(limited),
      },
    },
  );
}
