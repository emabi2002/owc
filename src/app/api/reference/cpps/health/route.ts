import { NextResponse } from "next/server";
import {
  isReferenceCppsHttpEnabled,
  referenceCppsHealthPayload,
  referenceCppsUnavailableResponse,
} from "@/lib/cpps/reference/http";

export async function GET() {
  if (!isReferenceCppsHttpEnabled()) return referenceCppsUnavailableResponse();
  return NextResponse.json(referenceCppsHealthPayload());
}
