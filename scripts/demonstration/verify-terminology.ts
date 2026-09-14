import { verifyDemonstrationTerminology } from "../../src/lib/demonstration/terminology";

const FILES = [
  "src/app/admin/(dashboard)/demonstration/page.tsx",
  "src/app/admin/(dashboard)/demonstration/officer/page.tsx",
  "src/app/admin/(dashboard)/demonstration/officer/[reference]/page.tsx",
  "src/components/admin/demonstration-service-controls.tsx",
  "docs/demonstration/presentation-script.md",
  "docs/verification/demonstration-uat.md",
] as const;

const failures: Array<{ file: string; violations: string[] }> = [];

for (const file of FILES) {
  const source = Bun.file(file);
  if (!(await source.exists())) {
    failures.push({ file, violations: ["missing presentation file"] });
    continue;
  }
  const result = verifyDemonstrationTerminology(await source.text());
  if (!result.ok) failures.push({ file, violations: result.violations });
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.file}: ${failure.violations.join(", ")}`);
  }
  process.exitCode = 1;
} else {
  console.log(`OWC demonstration terminology verified across ${FILES.length} presentation files.`);
}
