import { createHash } from "node:crypto";
import { buildManagementReport } from "@/lib/reporting/service";
import type { ManagementReportingRow, ManagementReportResult, ManagementReportRequest } from "@/lib/reporting/types";
import { generateAiResponse } from "./gateway";
import { interpretReferenceManagementQuestion } from "./management-interpreter";
import type { AiAdapter, AiProvider } from "./types";

export type ManagementAnalysisResult = {
  ok: boolean;
  analysisId: string;
  request?: ManagementReportRequest;
  report?: ManagementReportResult;
  narrative?: string;
  aiSource?: "reference" | "live";
  productionConnected?: boolean;
  error?: string;
};

function analysisId(question: string, request?: ManagementReportRequest): string {
  const digest = createHash("sha256")
    .update(question)
    .update(JSON.stringify(request ?? {}))
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `OWC-AI-${digest}`;
}

function minimizedReportContext(report: ManagementReportResult) {
  return {
    reportIdBasis: report.report,
    title: report.title,
    recordCount: report.recordCount,
    totals: report.totals,
    statusCounts: report.statusCounts,
    groups: report.groups.slice(0, 25),
    syntheticData: report.syntheticData,
    disclosure: report.disclosure,
  };
}

export async function analyzeManagementQuestion(input: {
  question: string;
  rows: readonly ManagementReportingRow[];
  ai?: { provider?: AiProvider; adapter?: AiAdapter };
}): Promise<ManagementAnalysisResult> {
  const interpreted = interpretReferenceManagementQuestion(input.question);
  if (!interpreted.supported) {
    return {
      ok: false,
      analysisId: analysisId(input.question),
      error: interpreted.reason,
    };
  }

  const report = buildManagementReport(input.rows, interpreted.request);
  const id = analysisId(input.question, interpreted.request);
  const prompt = [
    "Explain the following authorised OWC management report result in concise management language.",
    "Do not invent figures. Do not suggest or perform operational database writes.",
    `Question: ${input.question.trim()}`,
    `Authoritative report data: ${JSON.stringify(minimizedReportContext(report))}`,
  ].join("\n");

  const aiResult = await generateAiResponse(
    { purpose: "management_analysis", prompt },
    input.ai,
  );

  if (!aiResult.ok) {
    return {
      ok: false,
      analysisId: id,
      request: interpreted.request,
      report,
      error: aiResult.error ?? "Management AI is unavailable.",
      aiSource: aiResult.source,
      productionConnected: aiResult.productionConnected,
    };
  }

  return {
    ok: true,
    analysisId: id,
    request: interpreted.request,
    report,
    narrative: aiResult.text ?? "",
    aiSource: aiResult.source,
    productionConnected: aiResult.productionConnected,
  };
}
