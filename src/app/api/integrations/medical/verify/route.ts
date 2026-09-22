import { verifyMedicalCertificateIntegration } from "@/lib/integrations/persistent/gateway";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { medicalSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "medical",
    rateLimitKey: "integrations:medical:verify",
    schema: medicalSchema,
    execute: ({ certificateNo }) => verifyMedicalCertificateIntegration(certificateNo),
  });
}
