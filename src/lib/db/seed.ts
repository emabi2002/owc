/**
 * Seed / fallback dataset.
 *
 * This is the single source of truth used when Supabase is NOT configured
 * (local demo mode), and the reference content an administrator can import into
 * a fresh Supabase project. The data access layer (`src/lib/data/*`) returns
 * these objects, or their Supabase equivalents when credentials are present.
 */
import { IMG } from "@/lib/site-data";
import type {
  AdminClaim,
  AuditEntry,
  ContentItem,
  FaqItem,
  FormItem,
  LegislationItem,
  NewsItem,
  PublicationItem,
  ReportItem,
  Role,
  StaffMember,
  TenderItem,
} from "@/lib/data/types";

/* -------------------------------- News --------------------------------- */
export const SEED_NEWS: NewsItem[] = [
  {
    id: "n1",
    slug: "owc-digital-claims-launch",
    category: "Announcement",
    date: "2026-06-18",
    title: "OWC launches new online claims portal for faster determinations",
    excerpt:
      "Injured workers and employers can now lodge and track workers compensation claims digitally, reducing processing times across all provinces.",
    image: IMG.harbour,
    featured: true,
  },
  {
    id: "n2",
    slug: "ohs-awareness-week-2026",
    category: "Awareness",
    date: "2026-06-04",
    title: "National Occupational Health & Safety Awareness Week 2026",
    excerpt:
      "OWC partners with industry to promote safer workplaces, with free employer briefings held in Port Moresby, Lae and Mt Hagen.",
    image: IMG.heroWorker,
    featured: false,
  },
  {
    id: "n3",
    slug: "employer-levy-2026-notice",
    category: "Public Notice",
    date: "2026-05-21",
    title: "Public Notice: Employer policy renewal period now open",
    excerpt:
      "All registered employers are reminded to renew their workers compensation insurance policies before 31 July 2026 to remain compliant.",
    image: IMG.community,
    featured: false,
  },
  {
    id: "n4",
    slug: "consultation-act-review",
    category: "Consultation",
    date: "2026-05-09",
    title: "Public consultation: Review of the Workers Compensation Act",
    excerpt:
      "OWC invites submissions from workers, employers and the public on proposed amendments to modernise the compensation framework.",
    image: IMG.medical,
    featured: false,
  },
  {
    id: "n5",
    slug: "regional-office-kokopo",
    category: "Labour Update",
    date: "2026-04-27",
    title: "New OWC regional service desk opens in Kokopo",
    excerpt:
      "Workers and employers in the New Guinea Islands region can now access in-person claims support at the new Kokopo service desk.",
    image: IMG.child,
    featured: false,
  },
];

/* -------------------------------- Forms -------------------------------- */
export const SEED_FORMS: FormItem[] = [
  { id: "f1", code: "WC-1", title: "Worker's Application for Compensation", category: "Claims", format: "PDF", size: "248 KB", updated: "2026-03-01" },
  { id: "f2", code: "WC-2", title: "Notice of Workplace Accident / Injury", category: "Claims", format: "PDF", size: "190 KB", updated: "2026-03-01" },
  { id: "f3", code: "WC-3", title: "Claim for Dependants (Fatal Injury)", category: "Claims", format: "PDF", size: "204 KB", updated: "2026-02-12" },
  { id: "f4", code: "EMP-1", title: "Employer Registration Application", category: "Employer", format: "PDF", size: "176 KB", updated: "2026-01-20" },
  { id: "f5", code: "EMP-2", title: "Employer's Report of Injury", category: "Employer", format: "DOCX", size: "92 KB", updated: "2026-01-20" },
  { id: "f6", code: "EMP-3", title: "Annual Wages Declaration", category: "Employer", format: "PDF", size: "150 KB", updated: "2026-02-28" },
  { id: "f7", code: "MED-1", title: "Medical Practitioner's First Report", category: "Medical", format: "PDF", size: "210 KB", updated: "2026-03-15" },
  { id: "f8", code: "MED-2", title: "Medical Progress / Final Report", category: "Medical", format: "PDF", size: "198 KB", updated: "2026-03-15" },
  { id: "f9", code: "MED-3", title: "Permanent Incapacity Assessment", category: "Medical", format: "PDF", size: "232 KB", updated: "2026-02-02" },
  { id: "f10", code: "GUI-1", title: "Guide for Injured Workers", category: "Guidelines", format: "PDF", size: "1.2 MB", updated: "2026-04-10" },
  { id: "f11", code: "GUI-2", title: "Employer Compliance Handbook", category: "Guidelines", format: "PDF", size: "1.8 MB", updated: "2026-04-10" },
  { id: "f12", code: "GUI-3", title: "Schedule of Compensation Rates 2026", category: "Guidelines", format: "PDF", size: "640 KB", updated: "2026-01-05" },
];

/* ------------------------------- Reports ------------------------------- */
export const SEED_REPORTS: ReportItem[] = [
  { id: "r1", title: "OWC Annual Report 2025", year: "2025", size: "4.1 MB", desc: "Full operational and financial performance of the Office." },
  { id: "r2", title: "Workplace Injury Statistical Bulletin 2025", year: "2025", size: "2.3 MB", desc: "National injury rates by industry, province and severity." },
  { id: "r3", title: "Compensation Claims Review 2024", year: "2024", size: "1.9 MB", desc: "Claims lodged, determined and paid across the period." },
  { id: "r4", title: "OHS National Strategy 2024–2028", year: "2024", size: "3.4 MB", desc: "Strategic direction for safer PNG workplaces." },
  { id: "r5", title: "OWC Annual Report 2024", year: "2024", size: "3.8 MB", desc: "Full operational and financial performance of the Office." },
  { id: "r6", title: "Schedule of Compensation Rates", year: "2026", size: "640 KB", desc: "Current statutory rates and entitlements." },
];

/* -------------------------------- FAQs --------------------------------- */
export const SEED_FAQS: FaqItem[] = [
  { id: "q1", category: "Claims", q: "Who can lodge a workers compensation claim?", a: "Any worker employed under a contract of service in Papua New Guinea who suffers a personal injury by accident arising out of, or in the course of, their employment may lodge a claim under the Workers Compensation Act 1978. Dependants may also claim in the event of a work-related death." },
  { id: "q2", category: "Claims", q: "How soon must I report a workplace injury?", a: "Notice of the injury should be given to your employer as soon as practicable. Employers must notify the Office of Workers Compensation within 7 days of becoming aware of a workplace injury or illness." },
  { id: "q3", category: "Claims", q: "What documents do I need to submit?", a: "You will generally need a completed Worker's Application for Compensation (WC-1), a Medical Practitioner's First Report (MED-1), evidence of employment and wages, and any supporting documents such as witness statements or incident photographs." },
  { id: "q4", category: "Claims", q: "Is there a cost to lodge a claim?", a: "No. Lodging a workers compensation claim with the Office of Workers Compensation is free of charge. Be cautious of any third party requesting payment to process your claim." },
  { id: "q5", category: "Claims", q: "How long does a determination take?", a: "Straightforward claims are typically determined within 30–45 days of receiving all required documents. Complex claims involving permanent incapacity or dependant entitlements may take longer." },
  { id: "q6", category: "Claims", q: "Can I track my claim online?", a: "Yes. Once your claim is registered you will receive a reference number (for example OWC-2026-XXXXXX). Use the Track a Claim service on this portal to view real-time status updates." },
  { id: "q7", category: "Employers", q: "Do I have to register my business with OWC?", a: "Yes. Every employer in Papua New Guinea must register with the Office and maintain a current workers compensation insurance policy as required under the Act." },
  { id: "q8", category: "Employers", q: "What are my obligations after a workplace injury?", a: "You must record the incident, ensure the worker receives medical attention, and notify OWC within 7 days. You should also assist the worker to lodge their claim." },
  { id: "q9", category: "Payments", q: "How is compensation calculated?", a: "Compensation is calculated according to the statutory Schedule of Compensation Rates, taking into account the nature and degree of incapacity and the worker's earnings." },
  { id: "q10", category: "General", q: "How do I contact the Office of Workers Compensation?", a: "You can call our head office, email us, complete the online enquiry form, or visit one of our regional service desks. Full contact details are on the Contact page." },
];

/* ----------------------------- Publications ---------------------------- */
export const SEED_PUBLICATIONS: PublicationItem[] = [
  { id: "p1", title: "OWC Annual Report 2025", category: "Annual Report", description: "Comprehensive review of the Office's operations, claims activity and financial performance for 2025.", year: "2025", format: "PDF", size: "4.1 MB" },
  { id: "p2", title: "Workplace Injury Statistical Bulletin 2025", category: "Statistics", description: "Detailed national workplace injury statistics by industry, province and severity.", year: "2025", format: "PDF", size: "2.3 MB" },
  { id: "p3", title: "Guide for Injured Workers", category: "Guide", description: "A plain-language guide explaining the rights of injured workers and how to lodge a claim.", year: "2026", format: "PDF", size: "1.2 MB" },
  { id: "p4", title: "Employer Compliance Handbook", category: "Handbook", description: "Everything employers need to know about registration, insurance and reporting obligations.", year: "2026", format: "PDF", size: "1.8 MB" },
  { id: "p5", title: "OHS National Strategy 2024–2028", category: "Strategy", description: "The national strategic framework for advancing occupational health and safety in PNG.", year: "2024", format: "PDF", size: "3.4 MB" },
  { id: "p6", title: "OWC Corporate Plan 2025–2027", category: "Corporate Plan", description: "Strategic priorities, goals and performance measures for the Office of Workers Compensation.", year: "2025", format: "PDF", size: "2.0 MB" },
];

/* ----------------------------- Legislation ----------------------------- */
export const SEED_LEGISLATION: LegislationItem[] = [
  { id: "l1", title: "Workers Compensation Act 1978", reference: "Chapter 179", category: "Act", description: "The principal legislation establishing the workers compensation scheme and the Office of Workers Compensation.", enactedYear: "1978" },
  { id: "l2", title: "Workers Compensation Regulation", reference: "Subordinate", category: "Regulation", description: "Subordinate legislation prescribing forms, procedures and administrative requirements under the Act.", enactedYear: "1979" },
  { id: "l3", title: "Schedule of Compensation Rates 2026", reference: "Statutory Instrument", category: "Schedule", description: "Current statutory rates of compensation for injury, incapacity and death.", enactedYear: "2026" },
  { id: "l4", title: "Employment Act 1978", reference: "Chapter 373", category: "Act", description: "Related labour legislation governing conditions of employment in Papua New Guinea.", enactedYear: "1978" },
  { id: "l5", title: "Industrial Safety, Health and Welfare Act 1961", reference: "Chapter 175", category: "Act", description: "Legislation relating to industrial safety, health and welfare in workplaces.", enactedYear: "1961" },
  { id: "l6", title: "Workers Compensation (Amendment) — Proposed 2026", reference: "Draft Bill", category: "Amendment", description: "Proposed amendments currently open for public consultation to modernise the scheme.", enactedYear: "2026" },
];

/* ------------------------------- Tenders ------------------------------- */
export const SEED_TENDERS: TenderItem[] = [
  { id: "t1", reference: "OWC/RFT/2026/014", title: "Supply and delivery of office ICT equipment", category: "Goods & Services", description: "Procurement of desktop computers, networking equipment and peripherals for OWC offices nationwide.", status: "open", publishedDate: "2026-06-10", closingDate: "2026-07-15" },
  { id: "t2", reference: "OWC/RFT/2026/013", title: "Engagement of legal advisory services", category: "Professional Services", description: "Panel of legal service providers to support claims determinations and appeals.", status: "closing_soon", publishedDate: "2026-05-28", closingDate: "2026-07-02" },
  { id: "t3", reference: "OWC/RFT/2026/011", title: "Office fit-out — Kokopo regional service desk", category: "Construction", description: "Fit-out works for the new OWC regional service desk in Kokopo, East New Britain.", status: "open", publishedDate: "2026-06-01", closingDate: "2026-07-20" },
  { id: "t4", reference: "OWC/RFT/2026/008", title: "Provision of records digitisation services", category: "Professional Services", description: "Scanning and secure digitisation of historical claims records.", status: "closed", publishedDate: "2026-04-12", closingDate: "2026-05-30" },
  { id: "t5", reference: "OWC/RFT/2026/005", title: "Annual financial audit services", category: "Professional Services", description: "Independent external audit of the Office's annual financial statements.", status: "awarded", publishedDate: "2026-02-15", closingDate: "2026-03-28" },
];

/* ------------------------- Admin: CMS content -------------------------- */
export const SEED_CONTENT_ITEMS: ContentItem[] = [
  { id: "c1", title: "OWC launches new online claims portal", type: "News", author: "L. Aila", updated: "18 Jun 2026", status: "Published" },
  { id: "c2", title: "Employer policy renewal period now open", type: "Notice", author: "D. Mek", updated: "17 Jun 2026", status: "Submitted" },
  { id: "c3", title: "OHS Awareness Week 2026 programme", type: "News", author: "G. Sori", updated: "16 Jun 2026", status: "Submitted" },
  { id: "c4", title: "Schedule of Compensation Rates 2026", type: "Report", author: "F. Wartovo", updated: "14 Jun 2026", status: "Draft" },
  { id: "c5", title: "Employer Compliance Handbook (v3)", type: "Form", author: "D. Mek", updated: "12 Jun 2026", status: "Approved" },
  { id: "c6", title: "About OWC — Governance update", type: "Page", author: "L. Aila", updated: "10 Jun 2026", status: "Published" },
  { id: "c7", title: "Public consultation: Act review submissions", type: "Notice", author: "G. Sori", updated: "09 Jun 2026", status: "Submitted" },
  { id: "c8", title: "Medical Practitioner's First Report (MED-1)", type: "Form", author: "F. Wartovo", updated: "05 Jun 2026", status: "Published" },
  { id: "c9", title: "OWC/RFT/2026/014 — ICT equipment tender", type: "Tender", author: "D. Mek", updated: "10 Jun 2026", status: "Published" },
  { id: "c10", title: "Workers Compensation Act 1978 (digitised)", type: "Legislation", author: "L. Aila", updated: "02 Jun 2026", status: "Published" },
];

/* ------------------------- Admin: recent claims ------------------------ */
export const SEED_ADMIN_CLAIMS: AdminClaim[] = [
  { ref: "OWC-2026-004821", worker: "J. Kaupa", employer: "Highlands Construction Ltd", type: "Back injury", lodged: "18 Apr", status: "Under Assessment" },
  { ref: "OWC-2026-004820", worker: "M. Wari", employer: "Pacific Mining PNG", type: "Fracture", lodged: "18 Apr", status: "New" },
  { ref: "OWC-2026-004818", worker: "S. Tau", employer: "Lae Port Services", type: "Crush injury", lodged: "17 Apr", status: "Awaiting Documents" },
  { ref: "OWC-2026-004815", worker: "A. Bani", employer: "Niugini Manufacturing", type: "Laceration", lodged: "16 Apr", status: "Approved" },
  { ref: "OWC-2026-004812", worker: "R. Mendi", employer: "Coastal Logistics", type: "Occupational illness", lodged: "15 Apr", status: "Paid" },
  { ref: "OWC-2026-004809", worker: "T. Koim", employer: "Madang Agro Ltd", type: "Burn", lodged: "14 Apr", status: "Declined" },
];

/* ----------------------------- Admin: staff ---------------------------- */
export const SEED_STAFF: StaffMember[] = [
  { name: "Lawrence Aila", email: "l.aila@owc.gov.pg", role: "Administrator", status: "Active", lastActive: "Today, 09:42" },
  { name: "Dorothy Mek", email: "d.mek@owc.gov.pg", role: "Editor", status: "Active", lastActive: "Today, 09:15" },
  { name: "Grace Sori", email: "g.sori@owc.gov.pg", role: "Editor", status: "Active", lastActive: "Yesterday, 17:02" },
  { name: "Francis Wartovo", email: "f.wartovo@owc.gov.pg", role: "Reviewer", status: "Active", lastActive: "Yesterday, 16:30" },
  { name: "Peter Namaliu", email: "p.namaliu@owc.gov.pg", role: "Claims Officer", status: "Active", lastActive: "2 days ago" },
  { name: "Lucy Arore", email: "l.arore@owc.gov.pg", role: "Assessment Officer", status: "Active", lastActive: "Today, 08:54" },
  { name: "John Kera", email: "j.kera@owc.gov.pg", role: "Finance / Payment Officer", status: "Active", lastActive: "Yesterday, 15:48" },
  { name: "Margaret Aihi", email: "m.aihi@owc.gov.pg", role: "Management / Executive", status: "Active", lastActive: "Today, 10:05" },
  { name: "Helen Kila", email: "h.kila@owc.gov.pg", role: "Viewer", status: "Invited", lastActive: "—" },
];

export const ROLE_PERMISSIONS: { role: Role; can: string[] }[] = [
  { role: "Administrator", can: ["System administration", "Manage users & roles", "Publish content", "View audit logs", "System settings"] },
  { role: "Editor", can: ["Create & edit content", "Submit for review", "Upload forms & reports"] },
  { role: "Reviewer", can: ["Review & approve content", "Return for changes", "Publish approved items"] },
  { role: "Claims Officer", can: ["View & process claims", "Update claim status", "Request documents"] },
  { role: "Assessment Officer", can: ["View assigned claims", "Assess claim eligibility", "Record assessment outcomes"] },
  { role: "Finance / Payment Officer", can: ["View authorised claims", "Manage simulated payment workflow"] },
  { role: "Management / Executive", can: ["View management reports", "Export management reports", "Use read-only AI analyst", "View authorised report source data"] },
  { role: "Viewer", can: ["Read-only administrative dashboard access"] },
];

/* --------------------------- Admin: audit log -------------------------- */
export const SEED_AUDIT_LOG: AuditEntry[] = [
  { time: "2026-06-18 09:42", user: "L. Aila", action: "Published", target: "News: OWC launches new online claims portal", type: "publish" },
  { time: "2026-06-18 09:15", user: "D. Mek", action: "Submitted for review", target: "Notice: Employer policy renewal", type: "submit" },
  { time: "2026-06-18 08:58", user: "Admin", action: "Role changed", target: "User role change: G. Sori → Editor", type: "role_change" },
  { time: "2026-06-18 08:40", user: "unknown", action: "Failed sign-in", target: "Admin console (invalid credentials)", type: "failed_login" },
  { time: "2026-06-17 16:30", user: "F. Wartovo", action: "Updated", target: "Report: Schedule of Compensation Rates 2026", type: "update" },
  { time: "2026-06-17 15:02", user: "G. Sori", action: "Created", target: "News: OHS Awareness Week 2026 programme", type: "create" },
  { time: "2026-06-17 11:20", user: "L. Aila", action: "Signed in", target: "Admin console", type: "login" },
  { time: "2026-06-16 14:48", user: "D. Mek", action: "Deleted", target: "Draft: Outdated public notice", type: "delete" },
  { time: "2026-06-16 10:05", user: "F. Wartovo", action: "Approved", target: "Form: Employer Compliance Handbook", type: "approve" },
];

/* --------------------------- Sample claim ------------------------------ */
export const SEED_CLAIM = {
  reference: "OWC-2026-004821",
  worker: "J. Kaupa",
  employer: "Highlands Construction Ltd",
  injuryDate: "12 Apr 2026",
  lodged: "18 Apr 2026",
  type: "Lower-back injury (manual handling)",
  status: "Under Assessment",
  steps: [
    { label: "Claim received", done: true, date: "18 Apr 2026" },
    { label: "Documents verified", done: true, date: "22 Apr 2026" },
    { label: "Medical assessment", done: true, date: "02 May 2026" },
    { label: "Determination", done: false },
    { label: "Compensation payment", done: false },
  ] as { label: string; done: boolean; date?: string }[],
};