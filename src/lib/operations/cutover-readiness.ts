export const REQUIRED_CUTOVER_GATES = [
  "release-candidate",
  "production-platform",
  "production-data",
  "drupal-content",
  "identity-access",
  "evidence-security",
  "notifications",
  "cpps",
  "external-integrations",
  "backup-recovery",
  "security-assessment",
  "business-uat",
  "operations-support",
  "cutover-change",
  "production-authorization",
] as const;

export type CutoverGateId = (typeof REQUIRED_CUTOVER_GATES)[number];
export type CutoverGateStatus =
  | "ACCEPTED"
  | "NOT_READY"
  | "BLOCKED"
  | "NOT_APPLICABLE";

export type CutoverGateRecord = {
  id: CutoverGateId;
  status: CutoverGateStatus;
  owner?: string;
  evidenceReferences?: string[];
  scopeDecisionReference?: string;
  productionAuthorizationReference?: string;
  blocker?: string;
  notes?: string;
};

export type CutoverReadinessInput = {
  schemaVersion: string;
  releaseSha: string;
  targetEnvironment: string;
  generatedAt?: string;
  decisionAt?: string;
  gates: CutoverGateRecord[];
};

export type CutoverBlockerCode =
  | "invalid-release-sha"
  | "missing-target-environment"
  | "missing-gate"
  | "duplicate-gate"
  | "gate-not-accepted"
  | "missing-owner"
  | "missing-evidence"
  | "missing-scope-decision"
  | "missing-production-authorization";

export type CutoverBlocker = {
  code: CutoverBlockerCode;
  gateId?: CutoverGateId;
  message: string;
};

export type CutoverReadinessResult = {
  decision: "GO" | "NO-GO";
  releaseSha: string;
  targetEnvironment: string;
  blockers: CutoverBlocker[];
};

function present(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function evidencePresent(values: string[] | undefined): boolean {
  return Array.isArray(values) && values.some((value) => present(value));
}

/**
 * Evaluate cutover readiness only. This function has no I/O and performs no
 * deployment, DNS, database, credential, CPPS or external-system action.
 */
export function evaluateCutoverReadiness(
  input: CutoverReadinessInput,
): CutoverReadinessResult {
  const blockers: CutoverBlocker[] = [];

  if (!/^[0-9a-f]{40}$/i.test(input.releaseSha.trim())) {
    blockers.push({
      code: "invalid-release-sha",
      message: "A 40-character immutable release SHA is required.",
    });
  }

  if (!present(input.targetEnvironment)) {
    blockers.push({
      code: "missing-target-environment",
      message: "A target production environment identifier is required.",
    });
  }

  const byId = new Map<CutoverGateId, CutoverGateRecord[]>();
  for (const id of REQUIRED_CUTOVER_GATES) byId.set(id, []);

  for (const gate of input.gates) {
    const records = byId.get(gate.id);
    if (records) records.push(gate);
  }

  for (const id of REQUIRED_CUTOVER_GATES) {
    const records = byId.get(id) ?? [];

    if (records.length === 0) {
      blockers.push({
        code: "missing-gate",
        gateId: id,
        message: `Required cutover gate is missing: ${id}`,
      });
      continue;
    }

    if (records.length > 1) {
      blockers.push({
        code: "duplicate-gate",
        gateId: id,
        message: `Required cutover gate has duplicate decision records: ${id}`,
      });
      continue;
    }

    const gate = records[0];

    if (gate.status === "BLOCKED" || gate.status === "NOT_READY") {
      blockers.push({
        code: "gate-not-accepted",
        gateId: id,
        message: `${id} is ${gate.status}${present(gate.blocker) ? `: ${gate.blocker}` : ""}`,
      });
      continue;
    }

    if (gate.status === "NOT_APPLICABLE") {
      if (!present(gate.scopeDecisionReference)) {
        blockers.push({
          code: "missing-scope-decision",
          gateId: id,
          message: `${id} is NOT_APPLICABLE without an authorized scope-decision reference.`,
        });
      }
      if (!present(gate.owner)) {
        blockers.push({
          code: "missing-owner",
          gateId: id,
          message: `${id} is NOT_APPLICABLE without an accountable owner.`,
        });
      }
    }

    if (gate.status === "ACCEPTED") {
      if (!present(gate.owner)) {
        blockers.push({
          code: "missing-owner",
          gateId: id,
          message: `${id} is ACCEPTED without an accountable owner.`,
        });
      }
      if (!evidencePresent(gate.evidenceReferences)) {
        blockers.push({
          code: "missing-evidence",
          gateId: id,
          message: `${id} is ACCEPTED without an evidence reference.`,
        });
      }
    }

    if (id === "production-authorization") {
      if (gate.status !== "ACCEPTED" || !present(gate.productionAuthorizationReference)) {
        blockers.push({
          code: "missing-production-authorization",
          gateId: id,
          message:
            "Production authorization must be explicitly ACCEPTED with a distinct authorization reference.",
        });
      }
    }
  }

  return {
    decision: blockers.length === 0 ? "GO" : "NO-GO",
    releaseSha: input.releaseSha,
    targetEnvironment: input.targetEnvironment,
    blockers,
  };
}
