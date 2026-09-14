import type { EnquiryCategory, RouteDestination, RoutingConfiguration } from "./routing";

const CATEGORY_ENV: Record<Exclude<EnquiryCategory, "General Enquiries">, { email: string; phone: string; id: string; label: string }> = {
  Claims: { email: "OWC_ENQUIRY_CLAIMS_EMAIL", phone: "OWC_ENQUIRY_CLAIMS_PHONE", id: "claims-unit", label: "Claims Unit" },
  Assessment: { email: "OWC_ENQUIRY_ASSESSMENT_EMAIL", phone: "OWC_ENQUIRY_ASSESSMENT_PHONE", id: "assessment-unit", label: "Assessment Unit" },
  Payments: { email: "OWC_ENQUIRY_PAYMENTS_EMAIL", phone: "OWC_ENQUIRY_PAYMENTS_PHONE", id: "payments-unit", label: "Payments Unit" },
  "Employer Matters": { email: "OWC_ENQUIRY_EMPLOYER_EMAIL", phone: "OWC_ENQUIRY_EMPLOYER_PHONE", id: "employer-matters-unit", label: "Employer Matters Unit" },
  "Medical Evidence": { email: "OWC_ENQUIRY_MEDICAL_EMAIL", phone: "OWC_ENQUIRY_MEDICAL_PHONE", id: "medical-evidence-unit", label: "Medical Evidence Unit" },
  "Technical Support": { email: "OWC_ENQUIRY_TECHNICAL_EMAIL", phone: "OWC_ENQUIRY_TECHNICAL_PHONE", id: "technical-support-unit", label: "Technical Support" },
};

function contactDestination(input: {
  id: string;
  label: string;
  kind: "unit" | "central";
  email?: string;
  phone?: string;
}): RouteDestination {
  return {
    id: input.id,
    label: input.label,
    kind: input.kind,
    ...(input.email?.trim() ? { email: input.email.trim() } : {}),
    ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
  };
}

function demonstrationConfiguration(): RoutingConfiguration {
  const central = contactDestination({
    id: "central-enquiry-queue",
    label: "Central OWC Enquiry Queue",
    kind: "central",
    email: "enquiries@demo.owc.invalid",
  });
  return {
    central,
    categories: {
      Claims: contactDestination({ id: "claims-unit", label: "Claims Unit", kind: "unit", email: "claims@demo.owc.invalid" }),
      Assessment: contactDestination({ id: "assessment-unit", label: "Assessment Unit", kind: "unit", email: "assessment@demo.owc.invalid" }),
      Payments: contactDestination({ id: "payments-unit", label: "Payments Unit", kind: "unit", email: "payments@demo.owc.invalid" }),
      "Employer Matters": contactDestination({ id: "employer-matters-unit", label: "Employer Matters Unit", kind: "unit", email: "employer@demo.owc.invalid" }),
      "Medical Evidence": contactDestination({ id: "medical-evidence-unit", label: "Medical Evidence Unit", kind: "unit", email: "medical@demo.owc.invalid" }),
      "Technical Support": contactDestination({ id: "technical-support-unit", label: "Technical Support", kind: "unit", email: "technical@demo.owc.invalid" }),
      "General Enquiries": central,
    },
  };
}

function liveConfiguration(): RoutingConfiguration {
  const central = contactDestination({
    id: "central-enquiry-queue",
    label: "Central OWC Enquiry Queue",
    kind: "central",
    email: process.env.OWC_ENQUIRY_CENTRAL_EMAIL,
    phone: process.env.OWC_ENQUIRY_CENTRAL_PHONE,
  });
  const categories: Partial<Record<EnquiryCategory, RouteDestination>> = {
    "General Enquiries": central,
  };

  for (const [category, env] of Object.entries(CATEGORY_ENV) as Array<[
    Exclude<EnquiryCategory, "General Enquiries">,
    (typeof CATEGORY_ENV)[Exclude<EnquiryCategory, "General Enquiries">],
  ]>) {
    const destination = contactDestination({
      id: env.id,
      label: env.label,
      kind: "unit",
      email: process.env[env.email],
      phone: process.env[env.phone],
    });
    if (destination.email || destination.phone) categories[category] = destination;
  }

  return { central, categories };
}

/** Server-side routing configuration. Demo destinations use the reserved .invalid domain and can never be real mailboxes. */
export function buildPublicEnquiryRoutingConfiguration(input: { demonstration: boolean }): RoutingConfiguration {
  return input.demonstration ? demonstrationConfiguration() : liveConfiguration();
}
