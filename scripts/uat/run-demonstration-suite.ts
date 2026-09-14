import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { runDemonstrationUatSuite } from "../../src/lib/uat/demonstration-suite";

function resolveReleaseSha(): string | null {
  const githubSha = process.env.GITHUB_SHA?.trim();
  if (githubSha) return githubSha;

  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const outputPath = resolve(
  process.env.OWC_DEMONSTRATION_UAT_EVIDENCE_PATH?.trim() ||
    "artifacts/demonstration-uat-evidence.json",
);

const result = await runDemonstrationUatSuite({ releaseSha: resolveReleaseSha() });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, {
  encoding: "utf8",
  mode: 0o600,
});

console.log(
  `OWC demonstration UAT: ${result.summary.passed}/${result.summary.total} scenarios passed; evidence: ${outputPath}`,
);
console.log(
  "Mode: DEMONSTRATION — synthetic evidence only; demonstrationAcceptance=true; productionAcceptance=false. No real funds move.",
);

if (result.summary.status !== "passed") {
  process.exitCode = 1;
}
