import { describe, expect, test } from "bun:test";
import {
  allowedClaimTransitions,
  canTransitionClaim,
} from "./workflow";

describe("OWC claim lifecycle", () => {
  test("allows assessment and document-request paths from a new claim", () => {
    expect(allowedClaimTransitions("New")).toEqual([
      "Awaiting Documents",
      "Under Assessment",
    ]);
  });

  test("requires approval before a claim can be paid", () => {
    expect(canTransitionClaim("Under Assessment", "Paid")).toBe(false);
    expect(canTransitionClaim("Approved", "Paid")).toBe(true);
  });

  test("treats paid and declined claims as terminal", () => {
    expect(allowedClaimTransitions("Paid")).toEqual([]);
    expect(allowedClaimTransitions("Declined")).toEqual([]);
  });
});
