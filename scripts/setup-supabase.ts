/**
 * OWC — Supabase provisioning script (idempotent).
 *
 * Run AFTER applying `src/lib/db/schema.sql` in the Supabase SQL editor:
 *   bun run setup
 *
 * It will:
 *   1. Ensure an Administrator auth user exists (email-confirmed).
 *   2. Upsert that user's profile with the `administrator` role.
 *   3. Seed each content table with demo data when the table is empty.
 *
 * Safe to re-run. Reads credentials from .env.local (loaded by Bun).
 */
import { createClient } from "@supabase/supabase-js";
import {
  SEED_FAQS,
  SEED_FORMS,
  SEED_LEGISLATION,
  SEED_NEWS,
  SEED_PUBLICATIONS,
  SEED_REPORTS,
  SEED_TENDERS,
} from "@/lib/db/seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = (process.env.OWC_BOOTSTRAP_ADMIN_EMAILS || "admin@owc.gov.pg")
  .split(",")[0]
  .trim();
const ADMIN_PASSWORD = process.env.OWC_ADMIN_PASSWORD || "OWC-Admin-2026!";

if (!url || !serviceKey) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function isMissingTable(message?: string) {
  return Boolean(
    message &&
      (/relation .* does not exist/i.test(message) ||
        /Could not find the table/i.test(message) ||
        /schema cache/i.test(message)),
  );
}

async function ensureAdminUser(): Promise<string | null> {
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "OWC Administrator" },
  });

  if (!error && data.user) {
    console.log(`✓ Created admin user: ${ADMIN_EMAIL}`);
    return data.user.id;
  }

  // Already exists — locate and refresh password.
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    console.log(`✓ Admin user already existed; password reset: ${ADMIN_EMAIL}`);
    return existing.id;
  }

  console.error("✗ Could not create or find the admin user:", error?.message);
  return null;
}

async function ensureAdminProfile(userId: string) {
  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      email: ADMIN_EMAIL,
      full_name: "OWC Administrator",
      role: "administrator",
      status: "active",
    },
    { onConflict: "id" },
  );
  if (error) {
    if (isMissingTable(error.message)) {
      console.warn(
        "! profiles table not found — run src/lib/db/schema.sql first, then re-run setup.",
      );
    } else {
      console.warn("! Could not upsert admin profile:", error.message);
    }
    return false;
  }
  console.log("✓ Admin profile set to administrator");
  return true;
}

async function seedIfEmpty(
  table: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  const { count, error: countErr } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });

  if (countErr) {
    if (isMissingTable(countErr.message)) {
      console.warn(`! ${table}: table missing (apply schema.sql)`);
    } else {
      console.warn(`! ${table}: ${countErr.message}`);
    }
    return;
  }

  if ((count ?? 0) > 0) {
    console.log(`• ${table}: already has ${count} rows — skipped`);
    return;
  }

  const { error } = await admin.from(table).insert(rows);
  if (error) console.warn(`! ${table}: insert failed — ${error.message}`);
  else console.log(`✓ ${table}: seeded ${rows.length} rows`);
}

async function main() {
  console.log("OWC Supabase setup\n------------------");

  const userId = await ensureAdminUser();
  if (userId) await ensureAdminProfile(userId);

  await seedIfEmpty(
    "news",
    SEED_NEWS.map((n) => ({
      slug: n.slug,
      title: n.title,
      category: n.category,
      excerpt: n.excerpt,
      image_url: n.image,
      featured: n.featured,
      status: "published",
      published_at: n.date,
    })),
  );

  await seedIfEmpty(
    "forms",
    SEED_FORMS.map((f) => ({
      code: f.code,
      title: f.title,
      category: f.category,
      file_format: f.format,
      file_size: f.size,
      status: "published",
    })),
  );

  await seedIfEmpty(
    "reports",
    SEED_REPORTS.map((r) => ({
      title: r.title,
      description: r.desc,
      year: r.year,
      file_size: r.size,
      status: "published",
    })),
  );

  await seedIfEmpty(
    "faqs",
    SEED_FAQS.map((f, i) => ({
      question: f.q,
      answer: f.a,
      category: f.category,
      sort_order: i,
      status: "published",
    })),
  );

  await seedIfEmpty(
    "publications",
    SEED_PUBLICATIONS.map((p) => ({
      title: p.title,
      category: p.category,
      description: p.description,
      year: p.year,
      file_format: p.format,
      file_size: p.size,
      status: "published",
    })),
  );

  await seedIfEmpty(
    "legislation",
    SEED_LEGISLATION.map((l) => ({
      title: l.title,
      reference: l.reference,
      category: l.category,
      description: l.description,
      enacted_year: l.enactedYear,
      status: "published",
    })),
  );

  await seedIfEmpty(
    "tenders",
    SEED_TENDERS.map((t) => ({
      reference: t.reference,
      title: t.title,
      category: t.category,
      description: t.description,
      status: t.status,
      content_status: "published",
      published_date: t.publishedDate,
      closing_date: t.closingDate,
    })),
  );

  console.log("\n------------------");
  console.log(`Admin login: ${ADMIN_EMAIL}`);
  console.log(`Password:    ${ADMIN_PASSWORD}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
