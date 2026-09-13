import type { FormItem, NewsItem } from "@/lib/data/types";

export type PublicNewsItem = Pick<
  NewsItem,
  "id" | "slug" | "category" | "date" | "title" | "excerpt" | "body" | "image" | "featured"
>;

export type PublicFormItem = Pick<
  FormItem,
  "id" | "code" | "title" | "category" | "format" | "size" | "updated" | "fileUrl"
>;

export function serializePublicNews(items: Array<Record<string, unknown>>): PublicNewsItem[] {
  return items.map((item) => ({
    id: String(item.id ?? item.slug ?? ""),
    slug: String(item.slug ?? item.id ?? ""),
    category: String(item.category ?? "Announcement"),
    date: String(item.date ?? ""),
    title: String(item.title ?? "Untitled"),
    excerpt: String(item.excerpt ?? ""),
    body: item.body ? String(item.body) : undefined,
    image: String(item.image ?? ""),
    featured: Boolean(item.featured),
  }));
}

export function serializePublicForms(items: Array<Record<string, unknown>>): PublicFormItem[] {
  return items.map((item) => ({
    id: String(item.id ?? item.code ?? ""),
    code: String(item.code ?? ""),
    title: String(item.title ?? "Untitled"),
    category: String(item.category ?? "Claims") as PublicFormItem["category"],
    format: (item.format === "DOCX" ? "DOCX" : "PDF") as PublicFormItem["format"],
    size: String(item.size ?? "—"),
    updated: String(item.updated ?? ""),
    fileUrl: item.fileUrl ? String(item.fileUrl) : undefined,
  }));
}
