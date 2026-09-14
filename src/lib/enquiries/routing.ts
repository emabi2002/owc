export type EnquiryCategory =
  | "Claims"
  | "Assessment"
  | "Payments"
  | "Employer Matters"
  | "Medical Evidence"
  | "Technical Support"
  | "General Enquiries";

export type EnquiryPriority = "normal" | "high" | "urgent";

export type RouteDestination = {
  id: string;
  label: string;
  kind: "unit" | "central" | "officer";
  email?: string;
  phone?: string;
};

export type RoutingConfiguration = {
  central: RouteDestination;
  categories: Partial<Record<EnquiryCategory, RouteDestination>>;
  assignedOfficers?: Record<string, RouteDestination>;
};

export type EnquiryClassification = {
  category: EnquiryCategory;
  priority: EnquiryPriority;
  escalation: boolean;
};

export type RouteEnquiryInput = {
  message: string;
  linkedClaimReference?: string;
  assignedOfficerId?: string;
  assignedOfficerVerified?: boolean;
};

export type RoutingResult = EnquiryClassification & {
  destination: RouteDestination;
  fallbackUsed: boolean;
  reason: string;
};

function priorityFor(message: string): Pick<EnquiryClassification, "priority" | "escalation"> {
  if (/\b(emergency|fatal|fatality|died|death|life[- ]threatening|immediate danger)\b/i.test(message)) {
    return { priority: "urgent", escalation: true };
  }
  if (/\b(urgent|serious injury|hospitalised|hospitalized|overdue for more than 90 days)\b/i.test(message)) {
    return { priority: "high", escalation: true };
  }
  return { priority: "normal", escalation: false };
}

export function classifyEnquiry(message: string): EnquiryClassification {
  const q = message.trim().toLocaleLowerCase();
  let category: EnquiryCategory = "General Enquiries";

  if (/\b(portal|website|login|log in|password|technical|error|not working|cannot access|can't access|upload failed)\b/.test(q)) {
    category = "Technical Support";
  } else if (/\b(medical|doctor|certificate|medical report|practitioner|hospital report|clinical|med-1|med-2|med-3)\b/.test(q)) {
    category = "Medical Evidence";
  } else if (/\b(employer|company|business|registration|register my business|policy renewal|wages declaration)\b/.test(q)) {
    category = "Employer Matters";
  } else if (/\b(payment|compensation payment|paid|payout|bank transfer|settlement|scheduled payment)\b/.test(q)) {
    category = "Payments";
  } else if (/\b(assessment|assess|decision|determination|incapacity|review of decision)\b/.test(q)) {
    category = "Assessment";
  } else if (/\b(claim|workplace injury|work injury|accident|injured|injury|wc-1|lodge|lodging|fatal|died|death)\b/.test(q)) {
    category = "Claims";
  }

  return { category, ...priorityFor(message) };
}

function safeAssignedOfficer(
  input: RouteEnquiryInput,
  configuration: RoutingConfiguration,
): RouteDestination | null {
  if (
    !input.linkedClaimReference ||
    !input.assignedOfficerVerified ||
    !input.assignedOfficerId ||
    !configuration.assignedOfficers
  ) {
    return null;
  }
  const officer = configuration.assignedOfficers[input.assignedOfficerId];
  return officer?.kind === "officer" ? officer : null;
}

export function routeEnquiry(
  input: RouteEnquiryInput,
  configuration: RoutingConfiguration,
): RoutingResult {
  const classification = classifyEnquiry(input.message);
  const officer = safeAssignedOfficer(input, configuration);

  if (officer) {
    return {
      ...classification,
      destination: officer,
      fallbackUsed: false,
      reason: `Verified assigned officer selected for linked claim; classified as ${classification.category}.`,
    };
  }

  // If a caller supplied an officer identifier but it was not verified/resolved,
  // fail safely to the central queue rather than trusting free text or guessing.
  if (input.assignedOfficerId && !officer) {
    return {
      ...classification,
      destination: configuration.central,
      fallbackUsed: true,
      reason: "Assigned officer could not be safely verified; routed to the central OWC enquiry queue.",
    };
  }

  const configured = configuration.categories[classification.category];
  if (configured) {
    return {
      ...classification,
      destination: configured,
      fallbackUsed: false,
      reason: `Classified as ${classification.category} and routed to the configured responsible unit.`,
    };
  }

  return {
    ...classification,
    destination: configuration.central,
    fallbackUsed: true,
    reason: `No verified destination was configured for ${classification.category}; routed to the central OWC enquiry queue.`,
  };
}
