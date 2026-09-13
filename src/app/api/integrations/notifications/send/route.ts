import { sendSandboxNotification } from "@/lib/integrations/sandbox/agencies";
import { handleSandboxPost } from "@/lib/integrations/sandbox/http";
import { notificationSchema } from "@/lib/integrations/sandbox/validation";

export async function POST(request: Request) {
  return handleSandboxPost(request, {
    service: "notifications",
    rateLimitKey: "integrations:notifications:send",
    schema: notificationSchema,
    execute: (input) => sendSandboxNotification(input),
  });
}
