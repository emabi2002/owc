import { describe, expect, test } from "bun:test";

async function read(path: string): Promise<string> {
  return Bun.file(path).text();
}

describe("management reporting database shape", () => {
  test("fresh schema carries the optional reporting dimensions on claim_tracking", async () => {
    const schema = await read("src/lib/db/schema.sql");

    for (const field of [
      "province",
      "district",
      "industry",
      "occupation",
      "decision",
      "compensation_amount_pgk",
      "turnaround_days",
      "notification_status",
      "payment_status",
      "assigned_officer",
    ]) {
      expect(schema).toContain(field);
    }
    expect(schema).toContain("idx_claims_province");
    expect(schema).toContain("idx_claims_lodged_date");
  });

  test("already-provisioned databases have an idempotent reporting-data migration", async () => {
    const migration = await read(
      "src/lib/db/management-reporting-data-2026-09-14.sql",
    );

    expect(migration).toContain("alter table public.claim_tracking");
    expect(migration).toContain("add column if not exists province");
    expect(migration).toContain("add column if not exists compensation_amount_pgk");
    expect(migration).toContain("create index if not exists idx_claims_province");
  });

  test("Supabase row types mirror the reporting fields", async () => {
    const types = await read("src/lib/supabase/types.ts");

    expect(types).toContain("province: string | null");
    expect(types).toContain("compensation_amount_pgk: number | null");
    expect(types).toContain("turnaround_days: number | null");
    expect(types).toContain("assigned_officer: string | null");
  });
});
