import type {
  FaqItem,
  FormCategory,
  FormItem,
  LegislationItem,
  NewsItem,
  PublicationItem,
  ReportItem,
  TenderItem,
  TenderStatus,
} from "@/lib/data/types";
import { isDrupalConfigured, serverEnv } from "@/lib/env";
import {
  extractDrupalText,
  fetchDrupalCollection,
  mapDrupalNewsNode,
  type DrupalJsonApiNode,
} from "./client";

export function shouldUseDrupalContent(): boolean {
  if (serverEnv.contentSource === "supabase") return false;
  if (serverEnv.contentSource === "drupal") return isDrupalConfigured;
  return isDrupalConfigured;
}

function text(node: DrupalJsonApiNode, key: string): string {
  return extractDrupalText(node.attributes[key]);
}

function date(node: DrupalJsonApiNode, key: string, fallback = ""): string {
  const value =
    text(node, key) ||
    fallback ||
    node.attributes.changed ||
    node.attributes.created ||
    "";
  return value ? value.slice(0, 10) : "";
}

async function collection(
  contentType: string,
  sort?: string,
): Promise<DrupalJsonApiNode[] | null> {
  if (!shouldUseDrupalContent()) return null;
  try {
    return await fetchDrupalCollection(serverEnv.drupalBaseUrl, contentType, {
      sort,
      pageLimit: 100,
      token: serverEnv.drupalApiToken || undefined,
    });
  } catch (error) {
    console.error(
      `Drupal ${contentType} read failed; falling back to existing content source`,
      error,
    );
    return null;
  }
}

export async function getDrupalNews(): Promise<NewsItem[] | null> {
  const nodes = await collection("news", "-created");
  return nodes ? nodes.map(mapDrupalNewsNode) : null;
}

export async function getDrupalFaqs(): Promise<FaqItem[] | null> {
  const nodes = await collection("faq", "field_sort_order");
  return nodes
    ? nodes.map((node) => ({
        id: node.id,
        q:
          node.attributes.title ??
          (text(node, "field_question") || "Question"),
        a:
          text(node, "field_answer") ||
          extractDrupalText(node.attributes.body),
        category: text(node, "field_category") || "General",
      }))
    : null;
}

export async function getDrupalForms(): Promise<FormItem[] | null> {
  const nodes = await collection("form", "field_code");
  return nodes
    ? nodes.map((node) => ({
        id: node.id,
        code: text(node, "field_code") || "OWC",
        title: node.attributes.title ?? "Form",
        category: (text(node, "field_category") || "Claims") as FormCategory,
        format: (text(node, "field_file_format") || "PDF") as
          | "PDF"
          | "DOCX",
        size: text(node, "field_file_size") || "—",
        updated: date(node, "field_updated_date"),
        fileUrl: text(node, "field_file_url") || undefined,
      }))
    : null;
}

export async function getDrupalReports(): Promise<ReportItem[] | null> {
  const nodes = await collection("report", "-field_year");
  return nodes
    ? nodes.map((node) => ({
        id: node.id,
        title: node.attributes.title ?? "Report",
        year: text(node, "field_year") || "—",
        size: text(node, "field_file_size") || "—",
        desc:
          text(node, "field_description") ||
          extractDrupalText(node.attributes.body),
        fileUrl: text(node, "field_file_url") || undefined,
      }))
    : null;
}

export async function getDrupalPublications(): Promise<PublicationItem[] | null> {
  const nodes = await collection("publication", "-field_year");
  return nodes
    ? nodes.map((node) => ({
        id: node.id,
        title: node.attributes.title ?? "Publication",
        category: text(node, "field_category") || "Publication",
        description:
          text(node, "field_description") ||
          extractDrupalText(node.attributes.body),
        year: text(node, "field_year") || "—",
        format: text(node, "field_file_format") || "PDF",
        size: text(node, "field_file_size") || "—",
        fileUrl: text(node, "field_file_url") || undefined,
      }))
    : null;
}

export async function getDrupalLegislation(): Promise<LegislationItem[] | null> {
  const nodes = await collection("legislation", "-field_enacted_year");
  return nodes
    ? nodes.map((node) => ({
        id: node.id,
        title: node.attributes.title ?? "Legislation",
        reference: text(node, "field_reference"),
        category: text(node, "field_category") || "Legislation",
        description:
          text(node, "field_description") ||
          extractDrupalText(node.attributes.body),
        enactedYear: text(node, "field_enacted_year") || "—",
        fileUrl: text(node, "field_file_url") || undefined,
      }))
    : null;
}

export async function getDrupalTenders(): Promise<TenderItem[] | null> {
  const nodes = await collection("tender", "field_closing_date");
  return nodes
    ? nodes.map((node) => ({
        id: node.id,
        reference: text(node, "field_reference") || "OWC",
        title: node.attributes.title ?? "Tender",
        category: text(node, "field_category") || "Procurement",
        description:
          text(node, "field_description") ||
          extractDrupalText(node.attributes.body),
        status: (text(node, "field_tender_status") || "open") as TenderStatus,
        publishedDate: date(
          node,
          "field_published_date",
          node.attributes.created ?? "",
        ),
        closingDate: date(node, "field_closing_date"),
        fileUrl: text(node, "field_file_url") || undefined,
      }))
    : null;
}
