import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const scripts = [
  "deploy/backup/common.sh",
  "deploy/backup/backup-application-db.sh",
  "deploy/backup/backup-drupal.sh",
  "deploy/backup/backup-evidence-export.sh",
  "deploy/backup/finalize-backup.sh",
  "deploy/backup/verify-backup.sh",
  "deploy/backup/restore-application-db-rehearsal.sh",
  "deploy/backup/restore-drupal-rehearsal.sh",
];

describe("OWC backup and disaster recovery contract", () => {
  test("all backup and restore scripts fail fast and create private artifacts", () => {
    for (const path of scripts) {
      const content = read(path);
      expect(content).toContain("set -euo pipefail");
      expect(content).toContain("umask 077");
      expect(content).not.toContain("set -x");
      expect(content).not.toContain("printenv");
    }
  });

  test("application database backup uses PostgreSQL environment credentials rather than a URI argument", () => {
    const content = read("deploy/backup/backup-application-db.sh");
    expect(content).toContain("PGHOST");
    expect(content).toContain("PGDATABASE");
    expect(content).toContain("PGUSER");
    expect(content).toContain("pg_dump");
    expect(content).not.toContain("DATABASE_URL");
    expect(content).not.toContain("--dbname=http");
  });

  test("Drupal backup captures database and public media without archiving settings secrets", () => {
    const content = read("deploy/backup/backup-drupal.sh");
    expect(content).toContain("drupal-db.dump");
    expect(content).toContain("/opt/drupal/web/sites/default/files");
    expect(content).toContain("drupal-media.tar.gz");
    expect(content).not.toContain("sites/default/settings.php");
  });

  test("evidence backup only accepts an operator-provided export path", () => {
    const content = read("deploy/backup/backup-evidence-export.sh");
    expect(content).toContain("OWC_EVIDENCE_EXPORT_DIR");
    expect(content).toContain("evidence-export.tar.gz");
    expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("finalization records release metadata and checksum verification is mandatory", () => {
    const finalize = read("deploy/backup/finalize-backup.sh");
    const verify = read("deploy/backup/verify-backup.sh");

    expect(finalize).toContain("backup-manifest.json");
    expect(finalize).toContain("git rev-parse HEAD");
    expect(finalize).toContain("sha256sum");
    expect(finalize).toContain("SHA256SUMS");
    expect(verify).toContain("sha256sum -c");
    expect(verify).toContain("backup-manifest.json");
  });

  test("restore tooling is explicitly non-production and cannot replay CPPS", () => {
    const application = read("deploy/backup/restore-application-db-rehearsal.sh");
    const drupal = read("deploy/backup/restore-drupal-rehearsal.sh");
    const combined = `${application}\n${drupal}`;

    expect(combined).toContain("OWC_DR_REHEARSAL_CONFIRM");
    expect(combined).toContain("NONPRODUCTION");
    expect(application).toContain("_dr_rehearsal");
    expect(combined).toContain("verify-backup.sh");
    expect(combined).not.toContain("CPPS_API_KEY");
    expect(combined).not.toContain("/payments");
  });
});
