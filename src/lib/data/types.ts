/**
 * Application-facing domain types.
 *
 * These are the friendly, UI-oriented shapes returned by the data access layer
 * in `src/lib/data/*`. The layer maps raw Supabase rows (snake_case, see
 * `src/lib/supabase/types.ts`) into these types, or returns equivalent seed
 * objects when Supabase is not configured.
 */

export type NewsItem = {
  id: string;
  slug: string;
  category: string;
  date: string; // ISO date
  title: string;
  excerpt: string;
  body?: string;
  image: string;
  featured: boolean;
};

export type FormCategory = "Claims" | "Employer" | "Medical" | "Guidelines";

export type FormItem = {
  id: string;
  code: string;
  title: string;
  category: FormCategory;
  format: "PDF" | "DOCX";
  size: string;
  updated: string; // ISO date
  fileUrl?: string;
};

export type ReportItem = {
  id: string;
  title: string;
  year: string;
  size: string;
  desc: string;
  fileUrl?: string;
};

export type FaqItem = {
  id: string;
  q: string;
  a: string;
  category: string;
};

export type PublicationItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  year: string;
  format: string;
  size: string;
  fileUrl?: string;
};

export type LegislationItem = {
  id: string;
  title: string;
  reference: string;
  category: string;
  description: string;
  enactedYear: string;
  fileUrl?: string;
};

export type TenderStatus = "open" | "closing_soon" | "closed" | "awarded";

export type TenderItem = {
  id: string;
  reference: string;
  title: string;
  category: string;
  description: string;
  status: TenderStatus;
  publishedDate: string;
  closingDate: string;
  fileUrl?: string;
};

/* --------------------------- Admin / operational --------------------------- */

export type Role =
  | "Administrator"
  | "Editor"
  | "Reviewer"
  | "Claims Officer"
  | "Assessment Officer"
  | "Finance / Payment Officer"
  | "Viewer";

export type WorkflowStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "Published"
  | "Archived";

export type ContentType =
  | "News"
  | "Page"
  | "Report"
  | "Form"
  | "Notice"
  | "Publication"
  | "Legislation"
  | "Tender";

export type ContentItem = {
  id: string;
  title: string;
  type: ContentType;
  author: string;
  updated: string;
  status: WorkflowStatus;
};

export type ClaimStatus =
  | "New"
  | "Under Assessment"
  | "Awaiting Documents"
  | "Approved"
  | "Paid"
  | "Declined";

export type AdminClaim = {
  ref: string;
  worker: string;
  employer: string;
  type: string;
  lodged: string;
  status: ClaimStatus;
};

export type StaffMember = {
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
};

export type AuditEntry = {
  time: string;
  user: string;
  action: string;
  target: string;
  type:
    | "create"
    | "update"
    | "delete"
    | "publish"
    | "login"
    | "failed_login"
    | "approve"
    | "submit"
    | "role_change";
};

/** Unified search result across all content types. */
export type SearchResultType =
  | "Page"
  | "News"
  | "Publication"
  | "Legislation"
  | "Tender"
  | "FAQ"
  | "Form"
  | "Report";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  href: string;
  date?: string;
};
