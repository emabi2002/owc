import { generateAiResponse } from "@/lib/ai/gateway";
import type { AiAdapter, AiProvider } from "@/lib/ai/types";
import type { RoutingResult } from "./routing";

export type EnquiryContact = {
  name: string;
  email?: string;
  phone?: string;
};

export type PreferredContact = "email" | "phone" | "either";

export type ProfessionalEnquirySummary = {
  professionalSummary: string;
  category: RoutingResult["category"];
  routeId: string;
  routeLabel: string;
  priority: RoutingResult["priority"];
  escalation: boolean;
  source: "deterministic" | "live" | "reference";
};

function cleanMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ").slice(0, 2500);
}

function deterministicSummary(input: {
  message: string;
  route: RoutingResult;
  contact: EnquiryContact;
  preferredContact: PreferredContact;
}): string {
  const lines = [
    `Enquiry category: ${input.route.category}`,
    `Priority: ${input.route.priority}`,
    `Recommended route: ${input.route.destination.label}`,
    `Enquirer: ${input.contact.name}`,
    `Preferred contact: ${input.preferredContact}`,
  ];
  if (input.contact.email) lines.push(`Contact email: ${input.contact.email}`);
  if (input.contact.phone) lines.push(`Contact phone: ${input.contact.phone}`);
  lines.push(`Issue summary: ${cleanMessage(input.message)}`);
  return lines.join("\n");
}

function buildRewritePrompt(input: {
  message: string;
  route: RoutingResult;
  contact: EnquiryContact;
  preferredContact: PreferredContact;
}): string {
  return [
    "Rewrite the supplied public OWC enquiry into one concise professional English issue summary for an OWC officer.",
    "Use only facts explicitly supplied by the user. Do not invent an employer, injury, diagnosis, officer, destination, phone, email, claim status, payment amount or any other fact.",
    "Do not alter the server-selected category or route; those are metadata outside your authority.",
    `Server category: ${input.route.category}`,
    `Server route ID: ${input.route.destination.id}`,
    `Server route label: ${input.route.destination.label}`,
    `User message: ${cleanMessage(input.message)}`,
  ].join("\n");
}

export async function buildProfessionalEnquirySummary(input: {
  message: string;
  route: RoutingResult;
  contact: EnquiryContact;
  preferredContact: PreferredContact;
  ai?: { provider?: AiProvider; adapter?: AiAdapter };
}): Promise<ProfessionalEnquirySummary> {
  const fallback = deterministicSummary(input);
  const provider = input.ai?.provider ?? "disabled";

  if ((provider === "openai_compatible" || provider === "reference") && input.ai?.adapter) {
    const aiResult = await generateAiResponse(
      { purpose: "public_assistance", prompt: buildRewritePrompt(input) },
      input.ai,
    );
    if (aiResult.ok && aiResult.text?.trim()) {
      const professionalSummary = [
        `Enquiry category: ${input.route.category}`,
        `Priority: ${input.route.priority}`,
        `Recommended route: ${input.route.destination.label}`,
        `Enquirer: ${input.contact.name}`,
        `Preferred contact: ${input.preferredContact}`,
        ...(input.contact.email ? [`Contact email: ${input.contact.email}`] : []),
        ...(input.contact.phone ? [`Contact phone: ${input.contact.phone}`] : []),
        `Issue summary: ${aiResult.text.trim().slice(0, 2500)}`,
      ].join("\n");
      return {
        professionalSummary,
        category: input.route.category,
        routeId: input.route.destination.id,
        routeLabel: input.route.destination.label,
        priority: input.route.priority,
        escalation: input.route.escalation,
        source: aiResult.source === "live" ? "live" : "reference",
      };
    }
  }

  return {
    professionalSummary: fallback,
    category: input.route.category,
    routeId: input.route.destination.id,
    routeLabel: input.route.destination.label,
    priority: input.route.priority,
    escalation: input.route.escalation,
    source: "deterministic",
  };
}
