export const DASHBOARD_STATS = [
  { label: "Open claims", value: "1,284", delta: "+42 this week", trend: "up", icon: "FileText" },
  { label: "Pending approvals", value: "17", delta: "Content awaiting review", trend: "flat", icon: "ClipboardCheck" },
  { label: "New enquiries", value: "63", delta: "+12 today", trend: "up", icon: "Mail" },
  { label: "Registered employers", value: "8,640", delta: "+18 this month", trend: "up", icon: "Building2" },
];

export type ClaimStatus =
  | "New"
  | "Under Assessment"
  | "Awaiting Documents"
  | "Approved"
  | "Paid"
  | "Declined";

export const ADMIN_RECENT_CLAIMS: {
  ref: string;
  worker: string;
  employer: string;
  type: string;
  lodged: string;
  status: ClaimStatus;
}[] = [
  { ref: "OWC-2026-004821", worker: "J. Kaupa", employer: "Highlands Construction Ltd", type: "Back injury", lodged: "18 Apr", status: "Under Assessment" },
  { ref: "OWC-2026-004820", worker: "M. Wari", employer: "Pacific Mining PNG", type: "Fracture", lodged: "18 Apr", status: "New" },
  { ref: "OWC-2026-004818", worker: "S. Tau", employer: "Lae Port Services", type: "Crush injury", lodged: "17 Apr", status: "Awaiting Documents" },
  { ref: "OWC-2026-004815", worker: "A. Bani", employer: "Niugini Manufacturing", type: "Laceration", lodged: "16 Apr", status: "Approved" },
  { ref: "OWC-2026-004812", worker: "R. Mendi", employer: "Coastal Logistics", type: "Occupational illness", lodged: "15 Apr", status: "Paid" },
  { ref: "OWC-2026-004809", worker: "T. Koim", employer: "Madang Agro Ltd", type: "Burn", lodged: "14 Apr", status: "Declined" },
];

export type ContentStatus = "Draft" | "Pending Review" | "Published" | "Scheduled";

export type ContentItem = {
  id: string;
  title: string;
  type: "News" | "Page" | "Report" | "Form" | "Notice";
  author: string;
  updated: string;
  status: ContentStatus;
};

export const CONTENT_ITEMS: ContentItem[] = [
  { id: "c1", title: "OWC launches new online claims portal", type: "News", author: "L. Aila", updated: "18 Jun 2026", status: "Published" },
  { id: "c2", title: "Employer policy renewal period now open", type: "Notice", author: "D. Mek", updated: "17 Jun 2026", status: "Pending Review" },
  { id: "c3", title: "OHS Awareness Week 2026 programme", type: "News", author: "G. Sori", updated: "16 Jun 2026", status: "Pending Review" },
  { id: "c4", title: "Schedule of Compensation Rates 2026", type: "Report", author: "F. Wartovo", updated: "14 Jun 2026", status: "Draft" },
  { id: "c5", title: "Employer Compliance Handbook (v3)", type: "Form", author: "D. Mek", updated: "12 Jun 2026", status: "Scheduled" },
  { id: "c6", title: "About OWC — Governance update", type: "Page", author: "L. Aila", updated: "10 Jun 2026", status: "Published" },
  { id: "c7", title: "Public consultation: Act review submissions", type: "Notice", author: "G. Sori", updated: "09 Jun 2026", status: "Pending Review" },
  { id: "c8", title: "Medical Practitioner's First Report (MED-1)", type: "Form", author: "F. Wartovo", updated: "05 Jun 2026", status: "Published" },
];

export type AuditEntry = {
  time: string;
  user: string;
  action: string;
  target: string;
  type: "create" | "update" | "delete" | "publish" | "login" | "approve";
};

export const AUDIT_LOG: AuditEntry[] = [
  { time: "2026-06-18 09:42", user: "L. Aila", action: "Published", target: "News: OWC launches new online claims portal", type: "publish" },
  { time: "2026-06-18 09:15", user: "D. Mek", action: "Submitted for review", target: "Notice: Employer policy renewal", type: "update" },
  { time: "2026-06-18 08:58", user: "Admin", action: "Approved", target: "User role change: G. Sori → Editor", type: "approve" },
  { time: "2026-06-17 16:30", user: "F. Wartovo", action: "Updated", target: "Report: Schedule of Compensation Rates 2026", type: "update" },
  { time: "2026-06-17 15:02", user: "G. Sori", action: "Created", target: "News: OHS Awareness Week 2026 programme", type: "create" },
  { time: "2026-06-17 11:20", user: "L. Aila", action: "Signed in", target: "Admin console", type: "login" },
  { time: "2026-06-16 14:48", user: "D. Mek", action: "Deleted", target: "Draft: Outdated public notice", type: "delete" },
  { time: "2026-06-16 10:05", user: "F. Wartovo", action: "Updated", target: "Form: Employer Compliance Handbook", type: "update" },
];

export type Role = "Administrator" | "Editor" | "Claims Officer" | "Reviewer" | "Viewer";

export const STAFF: {
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
}[] = [
  { name: "Lawrence Aila", email: "l.aila@owc.gov.pg", role: "Administrator", status: "Active", lastActive: "Today, 09:42" },
  { name: "Dorothy Mek", email: "d.mek@owc.gov.pg", role: "Editor", status: "Active", lastActive: "Today, 09:15" },
  { name: "Grace Sori", email: "g.sori@owc.gov.pg", role: "Editor", status: "Active", lastActive: "Yesterday, 17:02" },
  { name: "Francis Wartovo", email: "f.wartovo@owc.gov.pg", role: "Reviewer", status: "Active", lastActive: "Yesterday, 16:30" },
  { name: "Peter Namaliu", email: "p.namaliu@owc.gov.pg", role: "Claims Officer", status: "Active", lastActive: "2 days ago" },
  { name: "Helen Kila", email: "h.kila@owc.gov.pg", role: "Viewer", status: "Invited", lastActive: "—" },
];

export const ROLE_PERMISSIONS: { role: Role; can: string[] }[] = [
  { role: "Administrator", can: ["Full access", "Manage users & roles", "Publish content", "View audit logs", "System settings"] },
  { role: "Editor", can: ["Create & edit content", "Submit for review", "Upload forms & reports"] },
  { role: "Reviewer", can: ["Review & approve content", "Return for changes", "Publish approved items"] },
  { role: "Claims Officer", can: ["View & process claims", "Update claim status", "Request documents"] },
  { role: "Viewer", can: ["Read-only dashboard access", "View reports"] },
];

export const APPROVAL_QUEUE = CONTENT_ITEMS.filter(
  (c) => c.status === "Pending Review"
);
