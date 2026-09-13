import { verifyEmployer } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { employerSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "ipa",
    rateLimitKey: "integrations:employers:verify",
    schema: employerSchema,
    execute: ({ registrationNo }) => verifyEmployer(registrationNo),
  });
}
