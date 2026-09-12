import type { NewsItem } from "@/lib/data/types";
import { IMG } from "@/lib/site-data";

export type DrupalJsonApiNode = {
  id: string;
  attributes: Record<string, unknown> & {
    title?: string;
    created?: string;
    changed?: string;
    path?: { alias?: string | null } | null;
  };
};

export type DrupalJsonApiCollection = {
  data: DrupalJsonApiNode[];
};

export function buildDrupalJsonApiUrl(
  baseUrl: string,
  contentType: string,
  options: { sort?: string; pageLimit?: number } = {},
): string {
  const base = baseUrl.replace(/\/+$/, "");
  const url = new URL(`${base}/jsonapi/node/${contentType}`);
  url.searchParams.set("filter[status]", "1");
  if (options.sort) url.searchParams.set("sort", options.sort);
  if (options.pageLimit) url.searchParams.set("page[limit]", String(options.pageLimit));
  return url.toString();
}

export function extractDrupalText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const field = value as { processed?: unknown; value?: unknown };
    if (typeof field.processed === "string") return field.processed;
    if (typeof field.value === "string") return field.value;
  }
  return "";
}

function textAttribute(attributes: Record<string, unknown>, key: string): string {
  return extractDrupalText(attributes[key]);
}

function booleanAttribute(attributes: Record<string, unknown>, key: string): boolean {
  return attributes[key] === true || attributes[key] === 1 || attributes[key] === "1";
}

function slugFromNode(node: DrupalJsonApiNode): string {
  const alias = node.attributes.path?.alias;
  if (alias) {
    const clean = alias.replace(/^\/+|\/+$/g, "");
    const parts = clean.split("/");
    return parts.at(-1) || node.id;
  }
  return node.id;
}

export function mapDrupalNewsNode(node: DrupalJsonApiNode): NewsItem {
  const attributes = node.attributes;
  const date = (attributes.created ?? attributes.changed ?? new Date().toISOString()).slice(0, 10);
  return {
    id: node.id,
    slug: slugFromNode(node),
    category: textAttribute(attributes, "field_category") || "Announcement",
    date,
    title: attributes.title ?? "Untitled",
    excerpt: textAttribute(attributes, "field_excerpt"),
    body: extractDrupalText(attributes.body) || undefined,
    image: textAttribute(attributes, "field_image_url") || IMG.harbour,
    featured: booleanAttribute(attributes, "field_featured"),
  };
}

export async function fetchDrupalCollection(
  baseUrl: string,
  contentType: string,
  options: {
    sort?: string;
    pageLimit?: number;
    token?: string;
    signal?: AbortSignal;
  } = {},
): Promise<DrupalJsonApiNode[]> {
  const url = buildDrupalJsonApiUrl(baseUrl, contentType, options);
  const headers: HeadersInit = {
    Accept: "application/vnd.api+json",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(url, {
    headers,
    signal: options.signal,
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error(`Drupal JSON:API request failed with ${response.status}`);
  }
  const payload = (await response.json()) as DrupalJsonApiCollection;
  return Array.isArray(payload.data) ? payload.data : [];
}
