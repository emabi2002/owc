import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { persistConfirmedEnquiry, type LiveEnquiryWriter } from "./persistence";
import type { ConfirmedEnquiryInput } from "./types";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

const input: ConfirmedEnquiryInput = {
  confirmed: true,
  name: "Lina Aro",
  email: null,
  phone: "+67570000000",
  category: "Medical Evidence",
  subject: "Medical report submission",
  message: "I need help sending my medical report.",
  sourceChannel: "android",
  language: "tpi",
  linkedClaimReference: "OWC-2026-005121",
  aiSummary: "Enquirer requests guidance for medical report submission.",
  routeDestination: "medical-unit",
  priority: "normal",
  notificationStatus: "pending",
};

describe("OWC live public enquiry persistence", () => {
  test("fails closed when live persistence is selected without an approved writer", async () => {
    await expect(persistConfirmedEnquiry(input, { mode: "live" })).rejects.toThrow("Live enquiry persistence is unavailable");
  });

  test("passes the confirmed server record to the live writer without changing its route", async () => {
    let captured: unknown = null;
    const writer: LiveEnquiryWriter = async (record) => {
      captured = record;
      return { ...record, id: "live-001" };
    };
    const saved = await persistConfirmedEnquiry(input, {
      mode: "live",
      writer,
      now: new Date("2026-09-14T09:30:00.000Z"),
      referenceSuffix: "LIV123",
    });
    expect(saved.reference).toBe("OWC-ENQ-20260914-LIV123");
    expect(saved.productionConnected).toBe(true);
    expect(saved.synthetic).toBe(false);
    expect((captured as { routeDestination: string }).routeDestination).toBe("medical-unit");
  });

  test("fresh schema, migration and Supabase types carry confirmed AI enquiry metadata", () => {
    const schema = read("src/lib/db/schema.sql");
    const migration = read("src/lib/db/public-ai-enquiries-2026-09-14.sql");
    const types = read("src/lib/supabase/types.ts");
    for (const field of [
      "reference", "source_channel", "language", "linked_claim_reference",
      "ai_summary", "route_destination", "priority", "confirmed_at", "notification_status",
    ]) {
      expect(schema).toContain(field);
      expect(migration).toContain(field);
    }
    for (const field of [
      "reference", "source_channel", "language", "linked_claim_reference",
      "ai_summary", "route_destination", "priority", "confirmed_at", "notification_status",
    ]) {
      expect(types).toContain(field);
    }
    expect(migration).toContain("drop not null");
  });

  test("live Supabase writer is server-side and uses the privileged admin client", () => {
    const source = read("src/lib/enquiries/live-writer.ts");
    expect(source).toContain("createAdminSupabaseClient");
    expect(source).toContain('.from("enquiries")');
    expect(source).toContain(".insert(");
    expect(source).not.toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});
