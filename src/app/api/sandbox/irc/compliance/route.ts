import { checkTaxCompliance } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { ircSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    rateLimitKey: "irc:compliance",
    schema: ircSchema,
    execute: ({ tin }) => checkTaxCompliance(tin),
  });
}
