import { NextRequest, NextResponse } from "next/server";
import { createOpenAiCompatibleAdapter } from "@/lib/ai/openai-compatible-provider";
import { createReferenceAiAdapter } from "@/lib/ai/reference-provider";
import type { AiAdapter, AiProvider } from "@/lib/ai/types";
import { publicReferralRequestSchema } from "@/lib/ai/public-validation";
import { isDemonstrationIdentityMode } from "@/lib/auth/identity-mode";
import { recordAudit } from "@/lib/data/audit";
import { serverEnv } from "@/lib/env";
import { buildPublicEnquiryRoutingConfiguration } from "@/lib/enquiries/configuration";
import {
  createLiveEnquiryWriter,
  updateLiveEnquiryNotificationStatus,
} from "@/lib/enquiries/live-writer";
import { deliverPublicEnquiryNotification } from "@/lib/enquiries/notification";
import {
  persistConfirmedEnquiry,
  updateReferenceEnquiryNotificationStatus,
} from "@/lib/enquiries/persistence";
import { routeEnquiry } from "@/lib/enquiries/routing";
import { buildProfessionalEnquirySummary } from "@/lib/enquiries/summary";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

function configuredAi(): { provider: AiProvider; adapter?: AiAdapter } {
  if (serverEnv.aiProvider === "reference") {
    return { provider: "reference", adapter: createReferenceAiAdapter() };
  }
  if (
    serverEnv.aiProvider === "openai_compatible" &&
    serverEnv.aiApiUrl &&
    serverEnv.aiApiKey &&
    serverEnv.aiModel
  ) {
    return {
      provider: "openai_compatible",
      adapter: createOpenAiCompatibleAdapter({
        apiUrl: serverEnv.aiApiUrl,
        apiKey: serverEnv.aiApiKey,
        model: serverEnv.aiModel,
      }),
    };
  }
  return { provider: "disabled" };
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = publicReferralRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "A referral can only be submitted after explicit confirmation with valid contact details.",
        issues: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const ip = getClientIp(request.headers);
  const limited = rateLimit(`public-ai-referral:${ip}:${parsed.data.channel}`, 6, 60_000);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many referral requests. Please try again shortly." },
      { status: 429, headers: { "Cache-Control": "no-store", ...rateLimitHeaders(limited) } },
    );
  }

  const demonstration = isDemonstrationIdentityMode();
  const routingConfiguration = buildPublicEnquiryRoutingConfiguration({ demonstration });

  // The client never selects the destination. Classification and routing are
  // recalculated from the confirmed user message on the server.
  const route = routeEnquiry(
    {
      message: parsed.data.message,
      linkedClaimReference: parsed.data.linkedClaimReference,
    },
    routingConfiguration,
  );

  const summary = await buildProfessionalEnquirySummary({
    message: parsed.data.message,
    route,
    contact: {
      name: parsed.data.contact.name,
      ...(parsed.data.contact.email ? { email: parsed.data.contact.email } : {}),
      ...(parsed.data.contact.phone ? { phone: parsed.data.contact.phone } : {}),
    },
    preferredContact: parsed.data.preferredContact,
    ai: configuredAi(),
  });

  const mode = demonstration ? "reference" : "live";
  const writer = mode === "live" ? createLiveEnquiryWriter() : undefined;
  if (mode === "live" && !writer) {
    return NextResponse.json(
      { error: "OWC enquiry persistence is currently unavailable. Nothing was sent." },
      { status: 503, headers: { "Cache-Control": "no-store", ...rateLimitHeaders(limited) } },
    );
  }

  let persisted;
  try {
    persisted = await persistConfirmedEnquiry(
      {
        confirmed: true,
        idempotencyKey: parsed.data.idempotencyKey,
        name: parsed.data.contact.name,
        email: parsed.data.contact.email ?? null,
        phone: parsed.data.contact.phone ?? null,
        category: route.category,
        subject: parsed.data.subject ?? `Public AI enquiry — ${route.category}`,
        message: parsed.data.message,
        sourceChannel: parsed.data.channel,
        language: parsed.data.locale,
        linkedClaimReference: parsed.data.linkedClaimReference ?? null,
        aiSummary: summary.professionalSummary,
        routeDestination: route.destination.id,
        priority: route.priority,
        notificationStatus: "pending",
      },
      { mode, writer },
    );
  } catch {
    return NextResponse.json(
      { error: "OWC could not record this enquiry. Nothing was sent." },
      { status: 503, headers: { "Cache-Control": "no-store", ...rateLimitHeaders(limited) } },
    );
  }

  const notification = await deliverPublicEnquiryNotification(
    {
      reference: persisted.reference,
      destination: route.destination,
      professionalSummary: summary.professionalSummary,
      priority: route.priority,
    },
    demonstration
      ? { notificationApiUrl: "", notificationApiKey: "", referenceEnabled: true }
      : {},
  );

  let notificationTrackingUpdated = false;
  if (mode === "reference") {
    notificationTrackingUpdated = Boolean(
      updateReferenceEnquiryNotificationStatus(persisted.reference, notification.status),
    );
  } else {
    notificationTrackingUpdated = await updateLiveEnquiryNotificationStatus(
      persisted.reference,
      notification.status,
    );
  }

  await recordAudit({
    action: "submit",
    entity: "public_ai_enquiry",
    entityId: persisted.reference,
    summary: demonstration
      ? "Public AI enquiry confirmed and routed in demonstration mode"
      : "Public AI enquiry confirmed and routed",
    ip,
    metadata: {
      category: route.category,
      priority: route.priority,
      routeId: route.destination.id,
      fallbackUsed: route.fallbackUsed,
      sourceChannel: parsed.data.channel,
      language: parsed.data.locale,
      notificationStatus: notification.status,
      notificationSource: notification.source,
      notificationProductionConnected: notification.productionConnected,
      notificationTrackingUpdated,
      synthetic: persisted.synthetic,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      reference: persisted.reference,
      confirmedAt: persisted.confirmedAt,
      summary: summary.professionalSummary,
      route: {
        category: route.category,
        priority: route.priority,
        escalation: route.escalation,
        id: route.destination.id,
        label: route.destination.label,
        fallbackUsed: route.fallbackUsed,
      },
      notification: {
        status: notification.status,
        source: notification.source,
        productionConnected: notification.productionConnected,
        deliveryNotice: notification.deliveryNotice ?? null,
      },
      demonstration: persisted.synthetic,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        ...rateLimitHeaders(limited),
      },
    },
  );
}
