import { NextResponse } from "next/server";
import { getNews } from "@/lib/data/content";
import { serializePublicNews } from "@/lib/public-api/content";

export async function GET() {
  const items = await getNews();
  return NextResponse.json({
    items: serializePublicNews(items as unknown as Array<Record<string, unknown>>),
  });
}
