import { getFaqs, getForms } from "@/lib/data/content";
import type { FaqItem, FormItem } from "@/lib/data/types";
import type { PublicKnowledgeItem, PublicKnowledgeMatch } from "./public-assistant.types";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "can", "do", "for", "how", "i", "is", "me", "my",
  "of", "on", "or", "the", "to", "what", "when", "where", "who", "with", "you",
]);

function words(value: string): Set<string> {
  return new Set(
    value
      .toLocaleLowerCase()
      .replace(/[^a-z0-9-]+/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
}

function faqKnowledge(faq: FaqItem): PublicKnowledgeItem {
  return {
    id: `faq:${faq.id}`,
    sourceType: "faq",
    sourceId: faq.id,
    title: faq.q,
    content: faq.a,
    category: faq.category,
    visibility: "public",
  };
}

function formKnowledge(form: FormItem): PublicKnowledgeItem {
  return {
    id: `form:${form.id}`,
    sourceType: "form",
    sourceId: form.id,
    title: `${form.code} — ${form.title}`,
    content: `${form.title}. Public OWC form ${form.code}; category ${form.category}; format ${form.format}.`,
    category: form.category,
    visibility: "public",
  };
}

/**
 * Project only approved public FAQ/form content into the AI knowledge boundary.
 * This function intentionally accepts no claim, audit, management-reporting,
 * payment-account or staff datasets.
 */
export function buildPublicKnowledge(
  faqs: readonly FaqItem[],
  forms: readonly FormItem[],
): PublicKnowledgeItem[] {
  return [
    ...faqs.map(faqKnowledge),
    ...forms.map(formKnowledge),
  ];
}

export async function loadPublicKnowledge(): Promise<PublicKnowledgeItem[]> {
  const [faqs, forms] = await Promise.all([getFaqs(), getForms()]);
  return buildPublicKnowledge(faqs, forms);
}

export function findPublicKnowledge(
  query: string,
  knowledge: readonly PublicKnowledgeItem[],
  limit = 5,
): PublicKnowledgeMatch {
  const queryWords = words(query);
  if (!queryWords.size) return { uncertain: true, items: [] };

  const ranked = knowledge
    .map((item) => {
      const titleWords = words(`${item.title} ${item.category}`);
      const bodyWords = words(item.content);
      let score = 0;
      for (const word of queryWords) {
        if (titleWords.has(word)) score += 3;
        if (bodyWords.has(word)) score += 1;
      }
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, Math.max(1, Math.min(limit, 8)));

  if (!ranked.length) return { uncertain: true, items: [] };
  return { uncertain: false, items: ranked.map(({ item }) => item) };
}
