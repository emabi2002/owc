/**
 * Public content data access layer.
 *
 * `OWC_CONTENT_SOURCE=drupal` is authoritative and fails closed if Drupal is
 * unavailable. `auto` is the transitional migration/rollback mode that may
 * fall back to Supabase or repository reference content. `supabase` explicitly
 * bypasses Drupal.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, publicEnv, serverEnv } from "@/lib/env";
import { IMG } from "@/lib/site-data";
import type { Database } from "@/lib/supabase/types";
import type {
  FaqItem,
  FormCategory,
  FormItem,
  LegislationItem,
  NewsItem,
  PublicationItem,
  ReportItem,
  TenderItem,
} from "@/lib/data/types";
import {
  SEED_FAQS,
  SEED_FORMS,
  SEED_LEGISLATION,
  SEED_NEWS,
  SEED_PUBLICATIONS,
  SEED_REPORTS,
  SEED_TENDERS,
} from "@/lib/db/seed";
import {
  getDrupalFaqs,
  getDrupalForms,
  getDrupalLegislation,
  getDrupalNews,
  getDrupalPublications,
  getDrupalReports,
  getDrupalTenders,
} from "@/lib/drupal/content";
import { selectAuthoritativeContent } from "@/lib/drupal/content-policy";

export const CONTENT_REVALIDATE = 60;

let cached: SupabaseClient<Database> | null = null;

function publicClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient<Database>(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
      { auth: { persistSession: false } },
    );
  }
  return cached;
}

function chooseDrupal<T>(drupal: T[] | null): T[] | null {
  if (serverEnv.contentSource === "drupal") {
    return selectAuthoritativeContent("drupal", drupal, []);
  }
  if (serverEnv.contentSource === "auto" && drupal?.length) return drupal;
  return null;
}

const iso = (d: string | null, fallback: string) => (d ?? fallback).slice(0, 10);

/* -------------------------------- News --------------------------------- */
export async function getNews(): Promise<NewsItem[]> {
  const selected = chooseDrupal(await getDrupalNews());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_NEWS;
  const { data, error } = await db
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data?.length) return SEED_NEWS;
  return data.map((r) => ({
    id: r.id,
    slug: r.slug,
    category: r.category,
    date: iso(r.published_at, r.created_at),
    title: r.title,
    excerpt: r.excerpt ?? "",
    body: r.body ?? undefined,
    image: r.image_url ?? IMG.harbour,
    featured: r.featured,
  }));
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const all = await getNews();
  return all.find((n) => n.slug === slug) ?? null;
}

export async function getNewsSlugs(): Promise<string[]> {
  const all = await getNews();
  return all.map((n) => n.slug);
}

/* -------------------------------- Forms -------------------------------- */
export async function getForms(): Promise<FormItem[]> {
  const selected = chooseDrupal(await getDrupalForms());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_FORMS;
  const { data, error } = await db
    .from("forms")
    .select("*")
    .eq("status", "published")
    .order("code");
  if (error || !data?.length) return SEED_FORMS;
  return data.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    category: r.category as FormCategory,
    format: (r.file_format as "PDF" | "DOCX") ?? "PDF",
    size: r.file_size ?? "—",
    updated: iso(r.updated_at, r.created_at),
    fileUrl: r.file_url ?? undefined,
  }));
}

/* ------------------------------- Reports ------------------------------- */
export async function getReports(): Promise<ReportItem[]> {
  const selected = chooseDrupal(await getDrupalReports());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_REPORTS;
  const { data, error } = await db
    .from("reports")
    .select("*")
    .eq("status", "published")
    .order("year", { ascending: false });
  if (error || !data?.length) return SEED_REPORTS;
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    year: r.year ?? "—",
    size: r.file_size ?? "—",
    desc: r.description ?? "",
    fileUrl: r.file_url ?? undefined,
  }));
}

/* -------------------------------- FAQs --------------------------------- */
export async function getFaqs(): Promise<FaqItem[]> {
  const selected = chooseDrupal(await getDrupalFaqs());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_FAQS;
  const { data, error } = await db
    .from("faqs")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  if (error || !data?.length) return SEED_FAQS;
  return data.map((r) => ({
    id: r.id,
    q: r.question,
    a: r.answer,
    category: r.category,
  }));
}

export async function getFaqsByCategory(
  category: string,
): Promise<FaqItem[]> {
  const all = await getFaqs();
  return category === "All"
    ? all
    : all.filter((f) => f.category === category);
}

/* ----------------------------- Publications ---------------------------- */
export async function getPublications(): Promise<PublicationItem[]> {
  const selected = chooseDrupal(await getDrupalPublications());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_PUBLICATIONS;
  const { data, error } = await db
    .from("publications")
    .select("*")
    .eq("status", "published")
    .order("year", { ascending: false });
  if (error || !data?.length) return SEED_PUBLICATIONS;
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description ?? "",
    year: r.year ?? "—",
    format: r.file_format ?? "PDF",
    size: r.file_size ?? "—",
    fileUrl: r.file_url ?? undefined,
  }));
}

/* ----------------------------- Legislation ----------------------------- */
export async function getLegislation(): Promise<LegislationItem[]> {
  const selected = chooseDrupal(await getDrupalLegislation());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_LEGISLATION;
  const { data, error } = await db
    .from("legislation")
    .select("*")
    .eq("status", "published")
    .order("enacted_year", { ascending: false });
  if (error || !data?.length) return SEED_LEGISLATION;
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    reference: r.reference ?? "",
    category: r.category,
    description: r.description ?? "",
    enactedYear: r.enacted_year ?? "—",
    fileUrl: r.file_url ?? undefined,
  }));
}

/* ------------------------------- Tenders ------------------------------- */
export async function getTenders(): Promise<TenderItem[]> {
  const selected = chooseDrupal(await getDrupalTenders());
  if (selected !== null) return selected;

  const db = publicClient();
  if (!db) return SEED_TENDERS;
  const { data, error } = await db
    .from("tenders")
    .select("*")
    .eq("content_status", "published")
    .order("closing_date", { ascending: true });
  if (error || !data?.length) return SEED_TENDERS;
  return data.map((r) => ({
    id: r.id,
    reference: r.reference,
    title: r.title,
    category: r.category,
    description: r.description ?? "",
    status: r.status,
    publishedDate: r.published_date ?? "",
    closingDate: r.closing_date ?? "",
    fileUrl: r.file_url ?? undefined,
  }));
}
