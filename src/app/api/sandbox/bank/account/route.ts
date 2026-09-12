import { verifyBankAccount } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { bankAccountSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    rateLimitKey: "bank:account",
    schema: bankAccountSchema,
    execute: ({ accountReference }) => verifyBankAccount(accountReference),
  });
}
