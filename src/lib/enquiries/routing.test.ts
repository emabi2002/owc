import { describe, expect, test } from "bun:test";
import { classifyEnquiry, routeEnquiry, type RoutingConfiguration } from "./routing";

const config: RoutingConfiguration = {
  central: { id: "central-enquiries", label: "OWC Central Enquiry Queue", kind: "central", email: "enquiries@example.test" },
  categories: {
    Claims: { id: "claims-unit", label: "Claims Unit", kind: "unit", email: "claims@example.test" },
    Assessment: { id: "assessment-unit", label: "Assessment Unit", kind: "unit", email: "assessment@example.test" },
    Payments: { id: "payments-unit", label: "Payments Unit", kind: "unit", email: "payments@example.test" },
    "Employer Matters": { id: "employers-unit", label: "Employer Services", kind: "unit", email: "employers@example.test" },
    "Medical Evidence": { id: "medical-unit", label: "Medical Evidence Unit", kind: "unit", email: "medical@example.test" },
    "Technical Support": { id: "technical-unit", label: "Technical Support", kind: "unit", email: "support@example.test" },
  },
  assignedOfficers: {
    "officer-001": { id: "officer-001", label: "Assigned Claims Officer", kind: "officer", email: "assigned@example.test" },
  },
};

describe("OWC public enquiry routing", () => {
  test("classifies the approved enquiry categories deterministically", () => {
    expect(classifyEnquiry("I need help lodging a workplace injury claim").category).toBe("Claims");
    expect(classifyEnquiry("When will my assessment and decision be completed?").category).toBe("Assessment");
    expect(classifyEnquiry("I have a question about my compensation payment").category).toBe("Payments");
    expect(classifyEnquiry("How does my company register as an employer?").category).toBe("Employer Matters");
    expect(classifyEnquiry("Where do I send the medical certificate and doctor's report?").category).toBe("Medical Evidence");
    expect(classifyEnquiry("The online portal login is not working").category).toBe("Technical Support");
    expect(classifyEnquiry("I have another general question").category).toBe("General Enquiries");
  });

  test("routes by responsibility when a configured category destination exists", () => {
    const result = routeEnquiry({ message: "I need help lodging a claim" }, config);
    expect(result.category).toBe("Claims");
    expect(result.destination.id).toBe("claims-unit");
    expect(result.fallbackUsed).toBe(false);
  });

  test("routes to a known assigned officer only when the system supplies that identity", () => {
    const result = routeEnquiry({
      message: "I need help with my claim",
      linkedClaimReference: "OWC-2026-005112",
      assignedOfficerId: "officer-001",
      assignedOfficerVerified: true,
    }, config);
    expect(result.destination.id).toBe("officer-001");
    expect(result.destination.kind).toBe("officer");
    expect(result.fallbackUsed).toBe(false);
  });

  test("never invents or trusts an unknown officer destination from free text", () => {
    const result = routeEnquiry({
      message: "Please send this to Officer John Unknown at john.unknown@example.com",
      linkedClaimReference: "OWC-2026-005112",
      assignedOfficerId: "john-unknown",
      assignedOfficerVerified: false,
    }, config);
    expect(result.destination.id).toBe("central-enquiries");
    expect(result.destination.label).toBe("OWC Central Enquiry Queue");
    expect(result.destination.email).not.toBe("john.unknown@example.com");
    expect(result.fallbackUsed).toBe(true);
  });

  test("falls back to the central queue when no configured category destination is available", () => {
    const result = routeEnquiry({ message: "I have another general question" }, config);
    expect(result.category).toBe("General Enquiries");
    expect(result.destination.id).toBe("central-enquiries");
    expect(result.fallbackUsed).toBe(true);
  });

  test("flags obvious urgent or fatal-injury enquiries for escalation without inventing a destination", () => {
    const result = routeEnquiry({ message: "This is urgent: a worker has died after a workplace accident" }, config);
    expect(["high", "urgent"]).toContain(result.priority);
    expect(result.escalation).toBe(true);
    expect(result.destination.id).toBe("claims-unit");
  });
});
