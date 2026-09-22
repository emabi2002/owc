import { describe, expect, test } from "bun:test";

const migration = "supabase/migrations/20260922155151_persistent_multi_agency_demonstration.sql";

describe("persistent multi-agency database contract", () => {
  test("isolates every institutional source in a named schema", async () => {
    const sql = (await Bun.file(migration).text()).toLowerCase();
    for (const schema of [
      "owc_core", "nid_registry", "ipa_registry", "irc_registry",
      "health_registry", "insurance_registry", "employment_registry",
      "banking_registry", "integration_hub", "audit", "reporting",
    ]) expect(sql).toContain(`create schema if not exists ${schema}`);
  });

  test("provides durable lookup, telemetry and simulated-payment RPCs", async () => {
    const sql = (await Bun.file(migration).text()).toLowerCase();
    for (const fn of [
      "owc_demo_lookup", "owc_demo_process_payment", "owc_demo_list_events",
      "owc_demo_list_service_state", "owc_demo_send_notification",
    ]) expect(sql).toContain(`function public.${fn}`);
    expect(sql).toContain("security invoker");
    expect(sql).toContain("grant execute");
    expect(sql).toContain("to service_role");
  });

  test("adds a read-only deployment verification boundary", async () => {
    const sql = (await Bun.file(
      "supabase/migrations/20260922163000_add_demonstration_verification_summary.sql",
    ).text()).toLowerCase();
    expect(sql).toContain("function public.owc_demo_verification_summary");
    expect(sql).toContain("language sql");
    expect(sql).toContain("stable");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("paymentSafetyConstraints".toLowerCase());
    expect(sql).toContain("grant execute");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("insert into");
    expect(sql).not.toContain("update ");
    expect(sql).not.toContain("delete from");
  });

  test("covers institutional foreign keys with indexes", async () => {
    const sql = (await Bun.file(
      "supabase/migrations/20260922164000_add_demonstration_foreign_key_indexes.sql",
    ).text()).toLowerCase();
    expect((sql.match(/create index if not exists/g) ?? [])).toHaveLength(12);
    for (const schema of [
      "banking_registry", "employment_registry", "health_registry",
      "insurance_registry", "owc_core",
    ]) expect(sql).toContain(`on ${schema}.`);
  });

  test("enforces synthetic records and impossible real-money movement", async () => {
    const sql = (await Bun.file(migration).text()).toLowerCase();
    expect(sql).toContain("money_movement boolean not null default false check (money_movement = false)");
    expect(sql).toContain("simulation boolean not null default true check (simulation = true)");
    expect(sql).toContain("on conflict");
    for (const scenario of ["owc-s01", "owc-s02", "owc-s03", "owc-s04", "owc-s05"])
      expect(sql).toContain(scenario);
  });

  test("creates private document buckets", async () => {
    const sql = (await Bun.file(migration).text()).toLowerCase();
    for (const bucket of [
      "owc-claim-evidence", "owc-identity-documents", "owc-medical-certificates",
      "owc-employment-documents", "owc-insurance-documents", "owc-simulated-receipts",
    ]) expect(sql).toContain(bucket);
    expect(sql).toContain("public, false");
  });
});
