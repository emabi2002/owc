/**
 * Static site configuration & presentation constants.
 *
 * IMPORTANT: This file holds only *configuration* — organisation details,
 * navigation, imagery, enquiry categories and aggregate chart constants.
 *
 * All CMS *content* (news, forms, reports, FAQs, publications, legislation,
 * tenders, pages) and operational data (claims, enquiries, users, audit) is
 * served by the Supabase-backed data access layer in `src/lib/data/*`, falling
 * back to `src/lib/db/seed.ts` when Supabase is not configured.
 */

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: { label: string; href: string; description?: string }[];
};

export const ORG = {
  name: "Office of Workers Compensation",
  shortName: "OWC",
  ministry: "Ministry of Labour & Employment",
  country: "Independent State of Papua New Guinea",
  act: "Workers Compensation Act 1978",
  phone: "+675 321 1200",
  emergency: "+675 321 1299",
  email: "info@owc.gov.pg",
  claimsEmail: "claims@owc.gov.pg",
  address: "OWC Haus, Level 3, Melanesian Way, Waigani",
  city: "National Capital District, Port Moresby",
  postal: "P.O. Box 5100, Boroko, NCD 111",
  hours: "Monday – Friday · 8:00 AM – 4:06 PM",
};

export const MAIN_NAV: NavItem[] = [
  {
    label: "About OWC",
    href: "/about",
    children: [
      { label: "Our Mandate", href: "/about#mandate", description: "Authority under the Workers Compensation Act 1978" },
      { label: "Functions & Responsibilities", href: "/about#functions", description: "What the Office delivers for PNG" },
      { label: "Governance & Structure", href: "/about#governance", description: "Reporting lines and accountability" },
      { label: "The Ministry", href: "/about#ministry", description: "Connection to Labour & Employment" },
    ],
  },
  {
    label: "Claims",
    href: "/claims",
    children: [
      { label: "Lodge a Claim", href: "/claims#lodge", description: "Submit a workers compensation claim online" },
      { label: "Track a Claim", href: "/claims#track", description: "Check the status of an existing claim" },
      { label: "Required Documents", href: "/claims#documents", description: "What you need to prepare" },
      { label: "Claims FAQs", href: "/faqs", description: "Answers for workers and employers" },
    ],
  },
  {
    label: "Employers",
    href: "/employers",
    children: [
      { label: "Register as an Employer", href: "/employers#register", description: "Statutory registration & policies" },
      { label: "Employer Obligations", href: "/employers#obligations", description: "Your duties under the Act" },
      { label: "Report a Workplace Injury", href: "/employers#report", description: "Notify OWC within 7 days" },
      { label: "Compensation Process", href: "/employers#process", description: "Step-by-step guidance" },
    ],
  },
  {
    label: "Reports & Data",
    href: "/reports",
    children: [
      { label: "Injury & Claims Statistics", href: "/reports#statistics", description: "National workplace data" },
      { label: "Occupational Health & Safety", href: "/reports#ohs", description: "OHS guidance & resources" },
      { label: "Annual Reports", href: "/reports#downloads", description: "Downloadable publications" },
    ],
  },
  {
    label: "Resources",
    href: "/publications",
    children: [
      { label: "Forms & Downloads", href: "/forms", description: "Claim, employer and medical forms" },
      { label: "Publications", href: "/publications", description: "Reports, guides and handbooks" },
      { label: "Legislation", href: "/legislation", description: "Acts, regulations and schedules" },
      { label: "Tenders & Procurement", href: "/tenders", description: "Current and past opportunities" },
      { label: "Frequently Asked Questions", href: "/faqs", description: "Answers to common questions" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

/*
 * Authentic Papua New Guinea imagery.
 * Sources: Wikimedia Commons (Australian DFAT / U.S. Navy public-domain sets,
 * all depicting PNG people and places) plus self-hosted assets in /public.
 */
export const IMG = {
  heroWorker:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Coast_Guard_conducts_port_visit_in_Port_Moresby%2C_Papua_New_Guinea_%2852306468429%29.jpg/1280px-Coast_Guard_conducts_port_visit_in_Port_Moresby%2C_Papua_New_Guinea_%2852306468429%29.jpg",
  harbour:
    "https://upload.wikimedia.org/wikipedia/commons/3/38/Bus_station_near_Walter_Bay%2C_from_hills_%28cropped%29.jpg",
  community:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Gerehu_Markets_Port_Moresby%2C_Papua_New_Guinea_%2810697727534%29.jpg/1280px-Gerehu_Markets_Port_Moresby%2C_Papua_New_Guinea_%2810697727534%29.jpg",
  child:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Gerehu_Markets_Port_Moresby%2C_Papua_New_Guinea_%2810697595053%29.jpg/1280px-Gerehu_Markets_Port_Moresby%2C_Papua_New_Guinea_%2810697595053%29.jpg",
  medical: "/png-medical.jpg",
};

export const QUICK_LINKS = [
  {
    title: "Lodge a Claim",
    href: "/claims#lodge",
    desc: "Injured at work? Start your compensation claim online in minutes.",
    icon: "FileText",
  },
  {
    title: "Track a Claim",
    href: "/claims#track",
    desc: "Already lodged? Follow your claim's progress with your reference number.",
    icon: "Search",
  },
  {
    title: "Employer Services",
    href: "/employers",
    desc: "Register, meet your obligations and report workplace injuries.",
    icon: "Building2",
  },
  {
    title: "Forms & Downloads",
    href: "/forms",
    desc: "Claim forms, medical reports, employer forms and guidelines.",
    icon: "Download",
  },
];

export const STAT_HIGHLIGHTS = [
  { label: "Claims lodged (2025)", value: "12,480", trend: "+6.2%" },
  { label: "Claims determined", value: "11,037", trend: "+8.1%" },
  { label: "Registered employers", value: "8,640", trend: "+4.0%" },
  { label: "Avg. determination time", value: "34 days", trend: "−11 days" },
];

export const CLAIMS_BY_INDUSTRY = [
  { industry: "Construction", value: 3120 },
  { industry: "Mining & Resources", value: 2640 },
  { industry: "Agriculture", value: 1980 },
  { industry: "Manufacturing", value: 1460 },
  { industry: "Transport & Logistics", value: 1290 },
  { industry: "Public Sector", value: 980 },
  { industry: "Other", value: 1010 },
];

export const CLAIMS_TREND = [
  { year: "2020", lodged: 8900, paid: 7600 },
  { year: "2021", lodged: 9450, paid: 8100 },
  { year: "2022", lodged: 10240, paid: 8900 },
  { year: "2023", lodged: 11080, paid: 9700 },
  { year: "2024", lodged: 11760, paid: 10380 },
  { year: "2025", lodged: 12480, paid: 11037 },
];

export const ENQUIRY_CATEGORIES = [
  "General Enquiry",
  "New Claim Assistance",
  "Existing Claim / Status",
  "Employer Registration",
  "Workplace Injury Report",
  "Medical / Assessment",
  "Forms & Documents",
  "Complaint or Feedback",
  "Media & Communications",
];
