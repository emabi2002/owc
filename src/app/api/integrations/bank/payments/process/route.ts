import { processSandboxPaymentIntegration } from "@/lib/integrations/persistent/gateway";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { bankPaymentSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "bank",
    rateLimitKey: "integrations:bank:payments:process",
    schema: bankPaymentSchema,
    execute: (input) => processSandboxPaymentIntegration(input),
  });
}
