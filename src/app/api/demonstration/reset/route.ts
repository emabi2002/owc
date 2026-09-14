import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import {
  isDemonstrationResetEnabled,
  resetDemonstrationEnvironment,
} from "@/lib/demonstration/reset";

export async function POST() {
  if (!isDemonstrationResetEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await requirePermission("settings.manage");
  const report = await resetDemonstrationEnvironment();
  return NextResponse.json(report, { status: 200 });
}
