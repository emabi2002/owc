import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  isDemonstrationServiceControlEnabled,
  isDemonstrationServiceName,
  isDemonstrationServiceStatus,
  listDemonstrationServiceStatuses,
  setDemonstrationServiceStatus,
} from "@/lib/demonstration/service-controls";

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function requireDemoAdministrator() {
  if (!isDemonstrationServiceControlEnabled()) return null;
  const user = await getSessionUser();
  if (!user || user.role !== "administrator" || !user.demo) return null;
  return user;
}

export async function GET() {
  const user = await requireDemoAdministrator();
  if (!user) return unavailable();
  return NextResponse.json(listDemonstrationServiceStatuses());
}

export async function PATCH(request: Request) {
  const user = await requireDemoAdministrator();
  if (!user) return unavailable();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const candidate = body as { service?: unknown; status?: unknown };
  const service = typeof candidate.service === "string" ? candidate.service : "";
  const status = typeof candidate.status === "string" ? candidate.status : "";

  if (!isDemonstrationServiceName(service) || !isDemonstrationServiceStatus(status)) {
    return NextResponse.json({ error: "Invalid demonstration service or status" }, { status: 400 });
  }

  return NextResponse.json(setDemonstrationServiceStatus(service, status));
}
