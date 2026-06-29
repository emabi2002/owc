import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { submitEnquiry } from "@/lib/cpps/api";
import { enquirySchema, parseOrErrors } from "@/lib/security/validation";
import { verifyCaptcha } from "@/lib/security/captcha";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(`enquiry:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = parseOrErrors(enquirySchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please check the form and try again.", fields: parsed.errors },
      { status: 400 },
    );
  }

  const captchaOk = await verifyCaptcha(parsed.data.captchaToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Security check failed. Please try again." },
      { status: 400 },
    );
  }

  const { name, email, phone, category, subject, message } = parsed.data;

  // Persist to Supabase when configured.
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from("enquiries").insert({
      name,
      email,
      phone: phone || null,
      category,
      subject: subject || null,
      message,
      source_ip: ip,
    });
  }

  // Forward to CPPS (mock when not configured).
  const result = await submitEnquiry({
    name,
    email,
    phone,
    category,
    subject,
    message,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    reference: result.data.reference,
    source: result.source,
  });
}
