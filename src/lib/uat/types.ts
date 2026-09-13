export type ReferenceUatMode = "REFERENCE/SANDBOX";
export type ReferenceUatStatus = "passed" | "failed";

export type ReferenceUatCheck = {
  key: string;
  label: string;
  status: ReferenceUatStatus;
  summary: string;
  correlationId?: string;
};

export type ReferenceUatScenarioId =
  | "REF-UAT-001"
  | "REF-UAT-002"
  | "REF-UAT-003"
  | "REF-UAT-004"
  | "REF-UAT-005"
  | "REF-UAT-006"
  | "REF-UAT-007";

export type ReferenceUatScenario = {
  id: ReferenceUatScenarioId;
  title: string;
  mode: ReferenceUatMode;
  status: ReferenceUatStatus;
  syntheticData: true;
  productionAcceptance: false;
  checks: ReferenceUatCheck[];
  evidence: Record<string, unknown>;
};

export type ReferenceUatSuiteSummary = {
  total: number;
  passed: number;
  failed: number;
  status: ReferenceUatStatus;
};

export type ReferenceUatSuiteResult = {
  suite: "OWC_REFERENCE_END_TO_END_UAT";
  mode: ReferenceUatMode;
  syntheticData: true;
  productionAcceptance: false;
  generatedAt: string;
  releaseSha: string | null;
  notice: string;
  scenarios: ReferenceUatScenario[];
  summary: ReferenceUatSuiteSummary;
};

export type ReferenceUatSuiteOptions = {
  releaseSha?: string | null;
  generatedAt?: string;
};
