/** Read-only live verification for the persistent multi-agency demonstration. */
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createPersistentIntegrationRepository } from "@/lib/integrations/persistent/repository";
import type { PersistentRpcClient } from "@/lib/integrations/persistent/types";

const scenarioNids = [
  { nid: "NID-00010001", matched: true },
  { nid: "NID-00010002", matched: true },
  { nid: "NID-00010003", matched: false },
  { nid: "NID-00010004", matched: true },
  { nid: "NID-00010005", matched: true },
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

  let verifiedScenarios = 0;
  for (const scenario of scenarioNids) {
    const response = await repository.lookup("nid", scenario.nid);
    if (response.data.matched === scenario.matched) verifiedScenarios += 1;
  }
  requireCondition(verifiedScenarios === scenarioNids.length, "five scenario identities");

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

  console.log(`Verified ${verifiedScenarios} deterministic demonstration scenarios.`);
  console.log(`Verified ${services.length} connected service-state records.`);
  console.log(`Verified ${expectedBuckets.length} private document buckets.`);
  console.log("Read-only verification passed; no transaction or real-money action was performed.");
}

main().catch(() => {
  console.error("Persistent demonstration verification failed. Check migration and server configuration.");
  process.exitCode = 1;
});
