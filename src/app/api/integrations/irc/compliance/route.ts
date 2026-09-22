import { checkTaxComplianceIntegration } from "@/lib/integrations/persistent/gateway";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { ircSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "irc",
    rateLimitKey: "integrations:irc:compliance",
    schema: ircSchema,
    execute: ({ tin }) => checkTaxComplianceIntegration(tin),
  });
}
