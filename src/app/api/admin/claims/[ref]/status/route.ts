import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";
import { transitionClaimStatus } from "@/lib/claims/transition-service";
import { isClaimWorkflowStatus } from "@/lib/claims/workflow";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "claims.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetStatus =
    body && typeof body === "object" && "status" in body
      ? String((body as { status: unknown }).status)
      : "";

  if (!isClaimWorkflowStatus(targetStatus)) {
    return NextResponse.json({ error: "Invalid claim status" }, { status: 400 });
  }

  const { ref } = await params;
  const result = await transitionClaimStatus({
    claimReference: decodeURIComponent(ref),
    targetStatus,
    actor: {
      id: user.id === "demo-admin" ? undefined : user.id,
      email: user.email,
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result);
}
