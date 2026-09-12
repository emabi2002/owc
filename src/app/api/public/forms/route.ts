import { NextResponse } from "next/server";
import { getForms } from "@/lib/data/content";
import { serializePublicForms } from "@/lib/public-api/content";

export async function GET() {
  const items = await getForms();
  return NextResponse.json({
    items: serializePublicForms(items as unknown as Array<Record<string, unknown>>),
  });
}
