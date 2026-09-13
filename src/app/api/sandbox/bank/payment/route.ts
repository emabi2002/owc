import { processSandboxPayment } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { bankPaymentSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    rateLimitKey: "bank:payment",
    schema: bankPaymentSchema,
    execute: (input) => processSandboxPayment(input),
    limit: 30,
  });
}
