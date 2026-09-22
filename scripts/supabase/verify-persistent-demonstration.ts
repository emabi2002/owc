/** Read-only live verification for the persistent multi-agency demonstration. */
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createPersistentIntegrationRepository } from "@/lib/integrations/persistent/repository";
import type { PersistentRpcClient } from "@/lib/integrations/persistent/types";

const scenarioIds = [
  "OWC-S01",
  "OWC-S02",
  "OWC-S03",
  "OWC-S04",
  "OWC-S05",
] as const;

const expectedBuckets = [
  "owc-claim-evidence",
  "owc-identity-documents",
  "owc-medical-certificates",
  "owc-employment-documents",
  "owc-insurance-documents",
  "owc-simulated-receipts",
] as const;

function requireCondition(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Verification failed: ${label}`);
}

async function main() {
  const admin = createAdminSupabaseClient();
  requireCondition(admin, "server-side Supabase configuration is unavailable");
  const repository = createPersistentIntegrationRepository(
    admin as unknown as PersistentRpcClient,
  );

  const { data: summary, error: summaryError } = await admin.rpc(
    "owc_demo_verification_summary" as never,
  );
  requireCondition(!summaryError && summary && typeof summary === "object", "verification summary");
  const verification = summary as Record<string, unknown>;
  requireCondition(
    JSON.stringify(verification.scenarioIds) === JSON.stringify(scenarioIds),
    "five deterministic scenarios",
  );
  for (const count of [
    "claimCount", "identityCount", "companyCount", "taxpayerCount",
    "medicalCertificateCount", "policyCount", "employeeCount", "bankAccountCount",
  ]) requireCondition(Number(verification[count]) >= 5, count);
  requireCondition(verification.paymentSafetyConstraints === true, "simulated-payment constraints");

  const services = await repository.listServiceState();
  requireCondition(services.length >= 8, "multi-agency service state");
  requireCondition(
    services.every((service) => ["online", "degraded"].includes(String(service.mode))),
    "service availability",
  );

  const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
  requireCondition(!bucketError && buckets, "private storage bucket listing");
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  for (const bucket of expectedBuckets) {
    requireCondition(bucketIds.has(bucket), `private bucket ${bucket}`);
  }

  console.log(`Verified ${scenarioIds.length} deterministic demonstration scenarios.`);
  console.log(`Verified ${services.length} connected service-state records.`);
  console.log(`Verified ${expectedBuckets.length} private document buckets.`);
  console.log("Read-only verification passed; no transaction or real-money action was performed.");
}

main().catch(() => {
  console.error("Persistent demonstration verification failed. Check migration and server configuration.");
  process.exitCode = 1;
});
