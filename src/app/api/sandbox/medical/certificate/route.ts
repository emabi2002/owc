import { verifyMedicalCertificate } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { medicalSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    rateLimitKey: "medical:certificate",
    schema: medicalSchema,
    execute: ({ certificateNo }) => verifyMedicalCertificate(certificateNo),
  });
}
