import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { runReferenceUatSuite } from "../../src/lib/uat/reference-suite";

function resolveReleaseSha(): string | null {
  const githubSha = process.env.GITHUB_SHA?.trim();
  if (githubSha) return githubSha;

  try {
    // Local fallback equivalent to: git rev-parse HEAD
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const outputPath = resolve(
  process.env.OWC_UAT_EVIDENCE_PATH?.trim() || "artifacts/reference-uat-evidence.json",
);
const result = runReferenceUatSuite({ releaseSha: resolveReleaseSha() });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, {
  encoding: "utf8",
  mode: 0o600,
});

console.log(
  `OWC reference UAT: ${result.summary.passed}/${result.summary.total} scenarios passed; evidence: ${outputPath}`,
);
console.log("Mode: REFERENCE/SANDBOX — synthetic evidence only; production acceptance is not implied.");

if (result.summary.status !== "passed") {
  process.exitCode = 1;
}
