import { verifyBankAccountIntegration } from "@/lib/integrations/persistent/gateway";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { bankAccountSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "bank",
    rateLimitKey: "integrations:bank:accounts:verify",
    schema: bankAccountSchema,
    execute: ({ accountReference }) => verifyBankAccountIntegration(accountReference),
  });
}
