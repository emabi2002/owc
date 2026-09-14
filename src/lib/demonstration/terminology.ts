export const DEMONSTRATION_BANNER = "DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS" as const;

const UNSAFE_PHRASES = [
  "production accepted",
  "real funds transferred",
  "live payment complete",
  "deployed to owc production",
] as const;

export type DemonstrationTerminologyResult = {
  ok: boolean;
  violations: string[];
};

export function verifyDemonstrationTerminology(text: string): DemonstrationTerminologyResult {
  const normalized = text.toLowerCase();
  const violations = UNSAFE_PHRASES.filter((phrase) => normalized.includes(phrase));
  return {
    ok: violations.length === 0,
    violations: [...violations],
  };
}
