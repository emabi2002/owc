import { NextResponse } from "next/server";

const services = [
  "nid",
  "ipa",
  "irc",
  "employer",
  "medical",
  "insurance",
  "bank",
  "notifications",
] as const;

export async function GET() {
  if (process.env.OWC_ENABLE_SANDBOX !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    source: "sandbox",
    environment: "OWC Integration Sandbox",
    warning: "Synthetic demonstration services only — not connected to production agencies.",
    services: services.map((service) => ({ service, status: "online" })),
    timestamp: new Date().toISOString(),
  });
}
