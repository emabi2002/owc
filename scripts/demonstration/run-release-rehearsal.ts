import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildDemonstrationRelease } from "../../src/lib/demonstration/release";

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
  process.env.OWC_DEMONSTRATION_RELEASE_EVIDENCE_PATH?.trim() ||
    "artifacts/demonstration-release.json",
);

const release = await buildDemonstrationRelease({ releaseSha: resolveReleaseSha() });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(release, null, 2)}\n`, {
  encoding: "utf8",
  mode: 0o600,
});

console.log(`OWC demonstration release: ${release.releaseStatus}`);
console.log(`Presentation UAT: ${release.uat.summary.passed}/${release.uat.summary.total} scenarios passed`);
console.log(`Evidence: ${outputPath}`);
console.log("productionAcceptance=false; simulation=true; moneyMovement=false");

if (!release.demonstrationAcceptance) {
  process.exitCode = 1;
}
