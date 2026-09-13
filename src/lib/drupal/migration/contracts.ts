export type DrupalMigrationBundle =
  | "news"
  | "page"
  | "form"
  | "report"
  | "faq"
  | "publication"
  | "legislation"
  | "tender";

export type DrupalModerationState =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";

export type SourceWorkflowStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "published"
  | "archived";

export type CanonicalContentRecord = {
  sourceType: string;
  sourceId: string;
  contentType: DrupalMigrationBundle;
  key: string;
  status: DrupalModerationState;
  attributes: Record<string, string | number | boolean | null>;
};

export type CanonicalMigrationDocument = {
  schemaVersion: 1;
  generatedAt: string;
  source: "supabase" | "repository-reference";
  records: CanonicalContentRecord[];
};

export type PageMigrationInput = {
  id: string;
  slug?: string;
  title: string;
  body?: string | null;
  category?: string | null;
  navigationWeight?: number | null;
  status?: SourceWorkflowStatus;
};
