import { verifyIdentityIntegration } from "@/lib/integrations/persistent/gateway";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { nidSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "nid",
    rateLimitKey: "integrations:nid:verify",
    schema: nidSchema,
    execute: ({ nid }) => verifyIdentityIntegration(nid),
  });
}
