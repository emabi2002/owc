import { verifyInsurancePolicy } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { insuranceSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    rateLimitKey: "insurance:policy",
    schema: insuranceSchema,
    execute: ({ policyNo }) => verifyInsurancePolicy(policyNo),
  });
}
