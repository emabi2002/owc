import { describe, expect, test } from "bun:test";

type Module = typeof import("./cutover-readiness");

async function load(): Promise<Module | null> {
  try {
    return await import("./cutover-readiness");
  } catch {
    return null;
  }
}

function acceptedGates(mod: Module) {
  return mod.REQUIRED_CUTOVER_GATES.map((id) => ({
    id,
    status: "ACCEPTED" as const,
    owner: `owner:${id}`,
    evidenceReferences: [`evidence:${id}`],
    ...(id === "production-authorization"
      ? { productionAuthorizationReference: "AUTH-OWC-GO-LIVE-001" }
      : {}),
  }));
}

describe("OWC final cutover readiness evaluator", () => {
  test("returns GO only for a complete, evidenced and explicitly authorized decision", async () => {
    const mod = await load();
    expect(mod).not.toBeNull();
    if (!mod) return;

    const result = mod.evaluateCutoverReadiness({
      schemaVersion: "1.0",
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      targetEnvironment: "production",
      gates: acceptedGates(mod),
    });

    expect(result.decision).toBe("GO");
    expect(result.blockers).toEqual([]);
  });

  test("returns NO-GO for missing or duplicate required gates", async () => {
    const mod = await load();
    expect(mod).not.toBeNull();
    if (!mod) return;

    const gates = acceptedGates(mod);
    const missing = mod.evaluateCutoverReadiness({
      schemaVersion: "1.0",
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      targetEnvironment: "production",
      gates: gates.slice(1),
    });
    expect(missing.decision).toBe("NO-GO");
    expect(missing.blockers.some((b) => b.code === "missing-gate")).toBe(true);

    const duplicate = mod.evaluateCutoverReadiness({
      schemaVersion: "1.0",
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      targetEnvironment: "production",
      gates: [...gates, gates[0]],
    });
    expect(duplicate.decision).toBe("NO-GO");
    expect(duplicate.blockers.some((b) => b.code === "duplicate-gate")).toBe(true);
  });

  test("returns NO-GO for BLOCKED or NOT_READY required gates", async () => {
    const mod = await load();
    expect(mod).not.toBeNull();
    if (!mod) return;

    for (const status of ["BLOCKED", "NOT_READY"] as const) {
      const gates = acceptedGates(mod);
      gates[3] = { id: gates[3].id, status, owner: "OWC", evidenceReferences: [] };
      const result = mod.evaluateCutoverReadiness({
        schemaVersion: "1.0",
        releaseSha: "0123456789abcdef0123456789abcdef01234567",
        targetEnvironment: "production",
        gates,
      });
      expect(result.decision).toBe("NO-GO");
      expect(result.blockers.some((b) => b.code === "gate-not-accepted")).toBe(true);
    }
  });

  test("requires owner and evidence for ACCEPTED gates", async () => {
    const mod = await load();
    expect(mod).not.toBeNull();
    if (!mod) return;

    const gates = acceptedGates(mod);
    gates[2] = { ...gates[2], owner: "", evidenceReferences: [] };
    const result = mod.evaluateCutoverReadiness({
      schemaVersion: "1.0",
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      targetEnvironment: "production",
      gates,
    });
    expect(result.decision).toBe("NO-GO");
    expect(result.blockers.some((b) => b.code === "missing-owner")).toBe(true);
    expect(result.blockers.some((b) => b.code === "missing-evidence")).toBe(true);
  });

  test("requires an authorized scope decision for NOT_APPLICABLE gates", async () => {
    const mod = await load();
    expect(mod).not.toBeNull();
    if (!mod) return;

    const gates = acceptedGates(mod);
    gates[8] = {
      id: "external-integrations",
      status: "NOT_APPLICABLE",
      owner: "Architecture Authority",
      evidenceReferences: [],
    };
    const result = mod.evaluateCutoverReadiness({
      schemaVersion: "1.0",
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      targetEnvironment: "production",
      gates,
    });
    expect(result.decision).toBe("NO-GO");
    expect(result.blockers.some((b) => b.code === "missing-scope-decision")).toBe(true);
  });

  test("requires a distinct production authorization reference", async () => {
    const mod = await load();
    expect(mod).not.toBeNull();
    if (!mod) return;

    const gates = acceptedGates(mod);
    gates[gates.length - 1] = {
      id: "production-authorization",
      status: "ACCEPTED",
      owner: "OWC Accountable Authority",
      evidenceReferences: ["minutes:go-live-board"],
    };
    const result = mod.evaluateCutoverReadiness({
      schemaVersion: "1.0",
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      targetEnvironment: "production",
      gates,
    });
    expect(result.decision).toBe("NO-GO");
    expect(result.blockers.some((b) => b.code === "missing-production-authorization")).toBe(true);
  });
});
