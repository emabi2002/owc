import {
  SEED_FAQS,
  SEED_FORMS,
  SEED_LEGISLATION,
  SEED_NEWS,
  SEED_PUBLICATIONS,
  SEED_REPORTS,
  SEED_TENDERS,
} from "@/lib/db/seed";
import type {
  CanonicalContentRecord,
  CanonicalMigrationDocument,
  SourceWorkflowStatus,
} from "./contracts";
import {
  normalizeFaq,
  normalizeForm,
  normalizeLegislation,
  normalizeNews,
  normalizePage,
  normalizePublication,
  normalizeReport,
  normalizeTender,
} from "./normalize";

export type MigrationSupabaseSnapshot = {
  pages?: Array<{
    id: string;
    slug: string;
    title: string;
    body?: string | null;
    status: SourceWorkflowStatus;
  }>;
  news?: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    excerpt?: string | null;
    body?: string | null;
    image_url?: string | null;
    featured?: boolean;
    status: SourceWorkflowStatus;
    published_at?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
  }>;
  forms?: Array<{
    id: string;
    code: string;
    title: string;
    category: string;
    file_format: string;
    file_size?: string | null;
    file_url?: string | null;
    status: SourceWorkflowStatus;
    updated_at?: string | null;
    created_at?: string | null;
  }>;
  reports?: Array<{
    id: string;
    title: string;
    description?: string | null;
    year?: string | null;
    file_size?: string | null;
    file_url?: string | null;
    status: SourceWorkflowStatus;
  }>;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
    status: SourceWorkflowStatus;
  }>;
  publications?: Array<{
    id: string;
    title: string;
    category: string;
    description?: string | null;
    year?: string | null;
    file_format?: string | null;
    file_size?: string | null;
    file_url?: string | null;
    status: SourceWorkflowStatus;
  }>;
  legislation?: Array<{
    id: string;
    title: string;
    reference?: string | null;
    category: string;
    description?: string | null;
    enacted_year?: string | null;
    file_url?: string | null;
    status: SourceWorkflowStatus;
  }>;
  tenders?: Array<{
    id: string;
    reference: string;
    title: string;
    category: string;
    description?: string | null;
    status: "open" | "closing_soon" | "closed" | "awarded";
    published_date?: string | null;
    closing_date?: string | null;
    file_url?: string | null;
    content_status: SourceWorkflowStatus;
  }>;
};

export type MigrationSourceCredentials = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

export type LoadedMigrationRecords = {
  source: CanonicalMigrationDocument["source"];
  records: CanonicalContentRecord[];
};

export type SupabaseSnapshotLoader = (
  credentials: MigrationSourceCredentials,
) => Promise<MigrationSupabaseSnapshot>;

export function buildMigrationDocument(
  records: CanonicalContentRecord[],
  source: CanonicalMigrationDocument["source"],
  generatedAt = new Date().toISOString(),
): CanonicalMigrationDocument {
  const seen = new Set<string>();
  for (const item of records) {
    if (seen.has(item.key)) {
      throw new Error(`Duplicate Drupal migration key: ${item.key}`);
    }
    seen.add(item.key);
  }

  const ordered = [...records].sort((a, b) => {
    const typeOrder = a.contentType.localeCompare(b.contentType);
    return typeOrder || a.key.localeCompare(b.key);
  });

  return {
    schemaVersion: 1,
    generatedAt,
    source,
    records: ordered,
  };
}

export function buildRepositoryReferenceRecords(): CanonicalContentRecord[] {
  return [
    ...SEED_NEWS.map((item) => normalizeNews(item)),
    ...SEED_FORMS.map((item) => normalizeForm(item)),
    ...SEED_REPORTS.map((item) => normalizeReport(item)),
    ...SEED_FAQS.map((item, index) => {
      const normalized = normalizeFaq(item);
      normalized.attributes.field_sort_order = index;
      return normalized;
    }),
    ...SEED_PUBLICATIONS.map((item) => normalizePublication(item)),
    ...SEED_LEGISLATION.map((item) => normalizeLegislation(item)),
    ...SEED_TENDERS.map((item) => normalizeTender(item)),
  ];
}

export async function loadMigrationRecords(
  credentials: MigrationSourceCredentials,
  loadSupabaseSnapshot: SupabaseSnapshotLoader,
): Promise<LoadedMigrationRecords> {
  if (!credentials.supabaseUrl || !credentials.serviceRoleKey) {
    return {
      source: "repository-reference",
      records: buildRepositoryReferenceRecords(),
    };
  }

  const snapshot = await loadSupabaseSnapshot(credentials);
  return {
    source: "supabase",
    records: recordsFromSupabaseSnapshot(snapshot),
  };
}

export function recordsFromSupabaseSnapshot(
  snapshot: MigrationSupabaseSnapshot,
): CanonicalContentRecord[] {
  const records: CanonicalContentRecord[] = [];

  for (const item of snapshot.pages ?? []) {
    records.push(
      normalizePage({
        id: item.id,
        slug: item.slug,
        title: item.title,
        body: item.body ?? null,
        status: item.status,
      }),
    );
  }

  for (const item of snapshot.news ?? []) {
    records.push(
      normalizeNews(
        {
          id: item.id,
          slug: item.slug,
          category: item.category,
          date:
            item.published_at ??
            item.updated_at ??
            item.created_at ??
            "",
          title: item.title,
          excerpt: item.excerpt ?? "",
          body: item.body ?? undefined,
          image: item.image_url ?? "",
          featured: item.featured ?? false,
        },
        item.status,
      ),
    );
  }

  for (const item of snapshot.forms ?? []) {
    records.push(
      normalizeForm(
        {
          id: item.id,
          code: item.code,
          title: item.title,
          category: item.category as "Claims" | "Employer" | "Medical" | "Guidelines",
          format: item.file_format === "DOCX" ? "DOCX" : "PDF",
          size: item.file_size ?? "—",
          updated: item.updated_at ?? item.created_at ?? "",
          fileUrl: item.file_url ?? undefined,
        },
        item.status,
      ),
    );
  }

  for (const item of snapshot.reports ?? []) {
    records.push(
      normalizeReport(
        {
          id: item.id,
          title: item.title,
          year: item.year ?? "—",
          size: item.file_size ?? "—",
          desc: item.description ?? "",
          fileUrl: item.file_url ?? undefined,
        },
        item.status,
      ),
    );
  }

  for (const item of snapshot.faqs ?? []) {
    const normalized = normalizeFaq(
      {
        id: item.id,
        q: item.question,
        a: item.answer,
        category: item.category,
      },
      item.status,
    );
    normalized.attributes.field_sort_order = item.sort_order;
    records.push(normalized);
  }

  for (const item of snapshot.publications ?? []) {
    records.push(
      normalizePublication(
        {
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description ?? "",
          year: item.year ?? "—",
          format: item.file_format ?? "PDF",
          size: item.file_size ?? "—",
          fileUrl: item.file_url ?? undefined,
        },
        item.status,
      ),
    );
  }

  for (const item of snapshot.legislation ?? []) {
    records.push(
      normalizeLegislation(
        {
          id: item.id,
          title: item.title,
          reference: item.reference ?? "",
          category: item.category,
          description: item.description ?? "",
          enactedYear: item.enacted_year ?? "—",
          fileUrl: item.file_url ?? undefined,
        },
        item.status,
      ),
    );
  }

  for (const item of snapshot.tenders ?? []) {
    records.push(
      normalizeTender(
        {
          id: item.id,
          reference: item.reference,
          title: item.title,
          category: item.category,
          description: item.description ?? "",
          status: item.status,
          publishedDate: item.published_date ?? "",
          closingDate: item.closing_date ?? "",
          fileUrl: item.file_url ?? undefined,
        },
        item.content_status,
      ),
    );
  }

  return records;
}
