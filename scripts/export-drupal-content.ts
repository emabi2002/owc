import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  buildMigrationDocument,
  loadMigrationRecords,
  type MigrationSourceCredentials,
  type MigrationSupabaseSnapshot,
} from "@/lib/drupal/migration/export";

async function loadSupabaseSnapshot(
  credentials: MigrationSourceCredentials,
): Promise<MigrationSupabaseSnapshot> {
  const client = createClient<Database>(
    credentials.supabaseUrl,
    credentials.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const [pages, news, forms, reports, faqs, publications, legislation, tenders] =
    await Promise.all([
      client.from("pages").select("*").order("id"),
      client.from("news").select("*").order("id"),
      client.from("forms").select("*").order("id"),
      client.from("reports").select("*").order("id"),
      client.from("faqs").select("*").order("sort_order"),
      client.from("publications").select("*").order("id"),
      client.from("legislation").select("*").order("id"),
      client.from("tenders").select("*").order("id"),
    ]);

  const failures = [
    ["pages", pages.error],
    ["news", news.error],
    ["forms", forms.error],
    ["reports", reports.error],
    ["faqs", faqs.error],
    ["publications", publications.error],
    ["legislation", legislation.error],
    ["tenders", tenders.error],
  ].filter(([, error]) => Boolean(error));

  if (failures.length) {
    throw new Error(
      `Supabase content export failed: ${failures
        .map(([table, error]) => `${table}: ${(error as { message: string }).message}`)
        .join("; ")}`,
    );
  }

  return {
    pages: pages.data ?? [],
    news: news.data ?? [],
    forms: forms.data ?? [],
    reports: reports.data ?? [],
    faqs: faqs.data ?? [],
    publications: publications.data ?? [],
    legislation: legislation.data ?? [],
    tenders: tenders.data ?? [],
  };
}

async function main() {
  const credentials: MigrationSourceCredentials = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };

  const loaded = await loadMigrationRecords(credentials, loadSupabaseSnapshot);
  const document = buildMigrationDocument(loaded.records, loaded.source);
  const output = resolve(
    process.cwd(),
    process.argv[2] ?? "drupal/migration/content-export.json",
  );

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(document, null, 2)}\n`, "utf8");

  const counts = document.records.reduce<Record<string, number>>((acc, record) => {
    acc[record.contentType] = (acc[record.contentType] ?? 0) + 1;
    return acc;
  }, {});

  console.log(
    JSON.stringify(
      {
        output,
        source: document.source,
        records: document.records.length,
        counts,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
