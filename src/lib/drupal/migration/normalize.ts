import type {
  FaqItem,
  FormItem,
  LegislationItem,
  NewsItem,
  PublicationItem,
  ReportItem,
  TenderItem,
} from "@/lib/data/types";
import type {
  CanonicalContentRecord,
  DrupalModerationState,
  PageMigrationInput,
  SourceWorkflowStatus,
} from "./contracts";

export function mapSourceStatus(
  status: SourceWorkflowStatus = "published",
): DrupalModerationState {
  switch (status) {
    case "submitted":
      return "review";
    case "approved":
      return "approved";
    case "archived":
      return "archived";
    case "draft":
      return "draft";
    case "published":
    default:
      return "published";
  }
}

function record(
  sourceType: string,
  sourceId: string,
  contentType: CanonicalContentRecord["contentType"],
  key: string,
  attributes: CanonicalContentRecord["attributes"],
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return {
    sourceType,
    sourceId,
    contentType,
    key,
    status: mapSourceStatus(status),
    attributes,
  };
}

export function normalizeNews(
  item: NewsItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return record(
    "news",
    item.id,
    "news",
    `news:${item.id}`,
    {
      title: item.title,
      body: item.body ?? null,
      field_category: item.category,
      field_excerpt: item.excerpt,
      field_image: item.image,
      field_featured: item.featured,
      source_slug: item.slug,
      source_date: item.date,
    },
    status,
  );
}

export function normalizeForm(
  item: FormItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return record(
    "forms",
    item.id,
    "form",
    `form:${item.code}`,
    {
      title: item.title,
      field_code: item.code,
      field_category: item.category,
      field_file_format: item.format,
      field_file_size: item.size,
      field_file_url: item.fileUrl ?? null,
      field_updated_date: item.updated,
    },
    status,
  );
}

export function normalizeReport(
  item: ReportItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return record(
    "reports",
    item.id,
    "report",
    `report:${item.id}`,
    {
      title: item.title,
      field_year: item.year,
      field_description: item.desc,
      field_file_size: item.size,
      field_file_url: item.fileUrl ?? null,
    },
    status,
  );
}

export function normalizeFaq(
  item: FaqItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return record(
    "faqs",
    item.id,
    "faq",
    `faq:${item.id}`,
    {
      title: item.q,
      field_question: item.q,
      field_answer: item.a,
      field_category: item.category,
      field_sort_order: 0,
    },
    status,
  );
}

export function normalizePublication(
  item: PublicationItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return record(
    "publications",
    item.id,
    "publication",
    `publication:${item.id}`,
    {
      title: item.title,
      field_category: item.category,
      field_description: item.description,
      field_year: item.year,
      field_file_format: item.format,
      field_file_size: item.size,
      field_file_url: item.fileUrl ?? null,
    },
    status,
  );
}

export function normalizeLegislation(
  item: LegislationItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  const naturalKey = item.reference?.trim() || item.id;
  return record(
    "legislation",
    item.id,
    "legislation",
    `legislation:${naturalKey}`,
    {
      title: item.title,
      field_reference: item.reference,
      field_category: item.category,
      field_description: item.description,
      field_enacted_year: item.enactedYear,
      field_file_url: item.fileUrl ?? null,
    },
    status,
  );
}

export function normalizeTender(
  item: TenderItem,
  status: SourceWorkflowStatus = "published",
): CanonicalContentRecord {
  return record(
    "tenders",
    item.id,
    "tender",
    `tender:${item.reference}`,
    {
      title: item.title,
      field_reference: item.reference,
      field_category: item.category,
      field_description: item.description,
      field_tender_status: item.status,
      field_published_date: item.publishedDate,
      field_closing_date: item.closingDate,
      field_file_url: item.fileUrl ?? null,
    },
    status,
  );
}

export function normalizePage(item: PageMigrationInput): CanonicalContentRecord {
  return record(
    "pages",
    item.id,
    "page",
    `page:${item.id}`,
    {
      title: item.title,
      body: item.body ?? null,
      field_category: item.category ?? null,
      field_navigation_weight: item.navigationWeight ?? 0,
      source_slug: item.slug ?? null,
    },
    item.status ?? "published",
  );
}
