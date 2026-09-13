import { NextResponse } from "next/server";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import { listDemoStaffPrincipals } from "@/lib/auth/demo-identity";
import { ROLE_LABELS } from "@/lib/auth/roles";

export async function GET() {
  if (!isDemonstrationIdentityMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    environment: "OWC Demonstration Environment",
    personas: listDemoStaffPrincipals().map((principal) => ({
      personaId: principal.personaId,
      fullName: principal.fullName,
      email: principal.email,
      role: principal.role ? ROLE_LABELS[principal.role] : null,
    })),
  });
}
