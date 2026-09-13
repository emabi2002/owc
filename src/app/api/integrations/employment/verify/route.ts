import { verifyEmployment } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { employmentSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "employer",
    rateLimitKey: "integrations:employment:verify",
    schema: employmentSchema,
    execute: ({ employeeNo }) => verifyEmployment(employeeNo),
  });
}
