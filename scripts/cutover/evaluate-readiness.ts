import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  evaluateCutoverReadiness,
  type CutoverReadinessInput,
} from "../../src/lib/operations/cutover-readiness";

function fail(message: string): never {
  console.error(`OWC cutover readiness: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

const evidencePath = process.argv[2] ?? process.env.OWC_CUTOVER_EVIDENCE_FILE;

if (!evidencePath?.trim()) {
  console.error(
    "Usage: bun run cutover:readiness -- <evidence.json> or set OWC_CUTOVER_EVIDENCE_FILE",
  );
  process.exitCode = 1;
} else {
  try {
    const input = JSON.parse(
      readFileSync(resolve(evidencePath), "utf8"),
    ) as CutoverReadinessInput;
    const result = evaluateCutoverReadiness(input);

    console.log(`Release SHA: ${result.releaseSha || "<missing>"}`);
    console.log(`Target environment: ${result.targetEnvironment || "<missing>"}`);
    console.log(`Decision: ${result.decision}`);

    if (result.blockers.length > 0) {
      console.log("Blockers:");
      for (const blocker of result.blockers) {
        const gate = blocker.gateId ? ` [${blocker.gateId}]` : "";
        console.log(`- ${blocker.code}${gate}: ${blocker.message}`);
      }
    }

    if (result.decision === "NO-GO") process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid evidence file";
    fail(message);
  }
}
