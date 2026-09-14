/**
 * Supabase `Database` type.
 *
 * Mirrors `src/lib/db/schema.sql`. In production this file can be regenerated
 * with:  `supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts`
 *
 * NOTE: row models are declared with `type` (not `interface`) so they satisfy
 * Supabase's `GenericSchema` constraint (which requires an implicit index
 * signature). Using `interface` here causes queries to infer `never`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContentStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "published"
  | "archived";

export type AppRole =
  | "administrator"
  | "editor"
  | "reviewer"
  | "claims_officer"
  | "assessment_officer"
  | "finance_officer"
  | "management"
  | "viewer";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "publish"
  | "login"
  | "failed_login"
  | "role_change"
  | "submit";

type Timestamped = {
  created_at: string;
  updated_at: string;
};

type BaseRow<TRow, TInsert, TUpdate> = {
  Row: TRow;
  Insert: TInsert;
  Update: TUpdate;
  Relationships: [];
};

/* ----------------------------- Row shapes ------------------------------ */

export type PageRow = Timestamped & {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  status: ContentStatus;
  author_id: string | null;
  reviewer_id: string | null;
  published_at: string | null;
  seo_keywords: string[] | null;
};

export type NewsRow = Timestamped & {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  featured: boolean;
  status: ContentStatus;
  author_id: string | null;
  reviewer_id: string | null;
  published_at: string | null;
};

export type PublicationRow = Timestamped & {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file_url: string | null;
  file_format: string | null;
  file_size: string | null;
  year: string | null;
  status: ContentStatus;
  published_at: string | null;
};

export type LegislationRow = Timestamped & {
  id: string;
  title: string;
  reference: string | null;
  category: string;
  description: string | null;
  file_url: string | null;
  enacted_year: string | null;
  status: ContentStatus;
  published_at: string | null;
};

export type TenderRow = Timestamped & {
  id: string;
  reference: string;
  title: string;
  category: string;
  description: string | null;
  status: "open" | "closing_soon" | "closed" | "awarded";
  published_date: string | null;
  closing_date: string | null;
  file_url: string | null;
  content_status: ContentStatus;
};

export type FaqRow = Timestamped & {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  status: ContentStatus;
};

export type FormRow = Timestamped & {
  id: string;
  code: string;
  title: string;
  category: string;
  file_format: string;
  file_size: string | null;
  file_url: string | null;
  status: ContentStatus;
};

export type ReportRow = Timestamped & {
  id: string;
  title: string;
  description: string | null;
  year: string | null;
  file_size: string | null;
  file_url: string | null;
  status: ContentStatus;
};

export type EnquiryRow = Timestamped & {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  subject: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  source_ip: string | null;
  handled_by: string | null;
};

export type ProfileRow = Timestamped & {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  status: "active" | "invited" | "suspended";
  last_active_at: string | null;
  mfa_enabled: boolean;
};

export type AuditLogRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  entity: string;
  entity_id: string | null;
  summary: string;
  metadata: Json | null;
  ip_address: string | null;
};

export type ClaimTrackingRow = Timestamped & {
  id: string;
  reference: string;
  worker_name: string;
  employer_name: string | null;
  province: string | null;
  district: string | null;
  industry: string | null;
  occupation: string | null;
  injury_type: string | null;
  injury_date: string | null;
  lodged_date: string | null;
  status: string;
  decision: string | null;
  compensation_amount_pgk: number | null;
  turnaround_days: number | null;
  notification_status: string | null;
  payment_status: string | null;
  assigned_officer: string | null;
  steps: Json | null;
  cpps_synced_at: string | null;
};

/* ----------------------------- Database -------------------------------- */

export type Database = {
  public: {
    Tables: {
      pages: BaseRow<
        PageRow,
        Partial<PageRow> & Pick<PageRow, "slug" | "title">,
        Partial<PageRow>
      >;
      news: BaseRow<
        NewsRow,
        Partial<NewsRow> & Pick<NewsRow, "slug" | "title" | "category">,
        Partial<NewsRow>
      >;
      publications: BaseRow<
        PublicationRow,
        Partial<PublicationRow> & Pick<PublicationRow, "title" | "category">,
        Partial<PublicationRow>
      >;
      legislation: BaseRow<
        LegislationRow,
        Partial<LegislationRow> & Pick<LegislationRow, "title" | "category">,
        Partial<LegislationRow>
      >;
      tenders: BaseRow<
        TenderRow,
        Partial<TenderRow> & Pick<TenderRow, "reference" | "title">,
        Partial<TenderRow>
      >;
      faqs: BaseRow<
        FaqRow,
        Partial<FaqRow> & Pick<FaqRow, "question" | "answer" | "category">,
        Partial<FaqRow>
      >;
      forms: BaseRow<
        FormRow,
        Partial<FormRow> & Pick<FormRow, "code" | "title" | "category">,
        Partial<FormRow>
      >;
      reports: BaseRow<
        ReportRow,
        Partial<ReportRow> & Pick<ReportRow, "title">,
        Partial<ReportRow>
      >;
      enquiries: BaseRow<
        EnquiryRow,
        Partial<EnquiryRow> &
          Pick<EnquiryRow, "name" | "email" | "category" | "message">,
        Partial<EnquiryRow>
      >;
      profiles: BaseRow<
        ProfileRow,
        Partial<ProfileRow> & Pick<ProfileRow, "id" | "email">,
        Partial<ProfileRow>
      >;
      audit_logs: BaseRow<
        AuditLogRow,
        Partial<AuditLogRow> & Pick<AuditLogRow, "action" | "entity" | "summary">,
        Partial<AuditLogRow>
      >;
      claim_tracking: BaseRow<
        ClaimTrackingRow,
        Partial<ClaimTrackingRow> &
          Pick<ClaimTrackingRow, "reference" | "worker_name" | "status">,
        Partial<ClaimTrackingRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      content_status: ContentStatus;
      app_role: AppRole;
      audit_action: AuditAction;
    };
    CompositeTypes: Record<string, never>;
  };
};
