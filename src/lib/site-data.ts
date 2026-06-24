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
      { label: "Claims FAQs", href: "/claims#faqs", description: "Answers for workers and employers" },
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
  { label: "Forms", href: "/forms" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

/* Confirmed-stable imagery (Unsplash canonical URLs) */
export const IMG = {
  heroWorker:
    "https://images.unsplash.com/photo-1528953030358-b0c7de371f1f?fm=jpg&q=75&w=1200&auto=format&fit=crop",
  harbour:
    "https://images.unsplash.com/photo-1763841625628-36d0e3631a91?fm=jpg&q=75&w=1400&auto=format&fit=crop",
  aerialCity:
    "https://images.unsplash.com/photo-1662505475505-cc7396a70a0c?fm=jpg&q=75&w=1400&auto=format&fit=crop",
  coastalVillage:
    "https://images.unsplash.com/photo-1590968336315-04f4fcef4c24?fm=jpg&q=75&w=1400&auto=format&fit=crop",
  medical:
    "https://images.unsplash.com/photo-1758653500301-2675f2478b43?fm=jpg&q=75&w=1200&auto=format&fit=crop",
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

export type ClaimStatusStep = {
  label: string;
  done: boolean;
  date?: string;
};

export const SAMPLE_CLAIM = {
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
  ] as ClaimStatusStep[],
};

export const NEWS = [
  {
    slug: "owc-digital-claims-launch",
    category: "Announcement",
    date: "2026-06-18",
    title: "OWC launches new online claims portal for faster determinations",
    excerpt:
      "Injured workers and employers can now lodge and track workers compensation claims digitally, reducing processing times across all provinces.",
    image:
      "https://images.unsplash.com/photo-1763841625628-36d0e3631a91?fm=jpg&q=75&w=1400&auto=format&fit=crop",
    featured: true,
  },
  {
    slug: "ohs-awareness-week-2026",
    category: "Awareness",
    date: "2026-06-04",
    title: "National Occupational Health & Safety Awareness Week 2026",
    excerpt:
      "OWC partners with industry to promote safer workplaces, with free employer briefings held in Port Moresby, Lae and Mt Hagen.",
    image:
      "https://images.unsplash.com/photo-1528953030358-b0c7de371f1f?fm=jpg&q=70&w=1200&auto=format&fit=crop",
    featured: false,
  },
  {
    slug: "employer-levy-2026-notice",
    category: "Public Notice",
    date: "2026-05-21",
    title: "Public Notice: Employer policy renewal period now open",
    excerpt:
      "All registered employers are reminded to renew their workers compensation insurance policies before 31 July 2026 to remain compliant.",
    image:
      "https://images.unsplash.com/photo-1662505475505-cc7396a70a0c?fm=jpg&q=75&w=1400&auto=format&fit=crop",
    featured: false,
  },
  {
    slug: "consultation-act-review",
    category: "Consultation",
    date: "2026-05-09",
    title: "Public consultation: Review of the Workers Compensation Act",
    excerpt:
      "OWC invites submissions from workers, employers and the public on proposed amendments to modernise the compensation framework.",
    image:
      "https://images.unsplash.com/photo-1758653500301-2675f2478b43?fm=jpg&q=70&w=1200&auto=format&fit=crop",
    featured: false,
  },
  {
    slug: "regional-office-kokopo",
    category: "Labour Update",
    date: "2026-04-27",
    title: "New OWC regional service desk opens in Kokopo",
    excerpt:
      "Workers and employers in the New Guinea Islands region can now access in-person claims support at the new Kokopo service desk.",
    image:
      "https://images.unsplash.com/photo-1590968336315-04f4fcef4c24?fm=jpg&q=75&w=1400&auto=format&fit=crop",
    featured: false,
  },
];

export type FormDoc = {
  code: string;
  title: string;
  category: "Claims" | "Employer" | "Medical" | "Guidelines";
  format: "PDF" | "DOCX";
  size: string;
  updated: string;
};

export const FORMS: FormDoc[] = [
  { code: "WC-1", title: "Worker's Application for Compensation", category: "Claims", format: "PDF", size: "248 KB", updated: "2026-03-01" },
  { code: "WC-2", title: "Notice of Workplace Accident / Injury", category: "Claims", format: "PDF", size: "190 KB", updated: "2026-03-01" },
  { code: "WC-3", title: "Claim for Dependants (Fatal Injury)", category: "Claims", format: "PDF", size: "204 KB", updated: "2026-02-12" },
  { code: "EMP-1", title: "Employer Registration Application", category: "Employer", format: "PDF", size: "176 KB", updated: "2026-01-20" },
  { code: "EMP-2", title: "Employer's Report of Injury", category: "Employer", format: "DOCX", size: "92 KB", updated: "2026-01-20" },
  { code: "EMP-3", title: "Annual Wages Declaration", category: "Employer", format: "PDF", size: "150 KB", updated: "2026-02-28" },
  { code: "MED-1", title: "Medical Practitioner's First Report", category: "Medical", format: "PDF", size: "210 KB", updated: "2026-03-15" },
  { code: "MED-2", title: "Medical Progress / Final Report", category: "Medical", format: "PDF", size: "198 KB", updated: "2026-03-15" },
  { code: "MED-3", title: "Permanent Incapacity Assessment", category: "Medical", format: "PDF", size: "232 KB", updated: "2026-02-02" },
  { code: "GUI-1", title: "Guide for Injured Workers", category: "Guidelines", format: "PDF", size: "1.2 MB", updated: "2026-04-10" },
  { code: "GUI-2", title: "Employer Compliance Handbook", category: "Guidelines", format: "PDF", size: "1.8 MB", updated: "2026-04-10" },
  { code: "GUI-3", title: "Schedule of Compensation Rates 2026", category: "Guidelines", format: "PDF", size: "640 KB", updated: "2026-01-05" },
];

export const REPORTS = [
  { title: "OWC Annual Report 2025", year: "2025", size: "4.1 MB", desc: "Full operational and financial performance of the Office." },
  { title: "Workplace Injury Statistical Bulletin 2025", year: "2025", size: "2.3 MB", desc: "National injury rates by industry, province and severity." },
  { title: "Compensation Claims Review 2024", year: "2024", size: "1.9 MB", desc: "Claims lodged, determined and paid across the period." },
  { title: "OHS National Strategy 2024–2028", year: "2024", size: "3.4 MB", desc: "Strategic direction for safer PNG workplaces." },
  { title: "OWC Annual Report 2024", year: "2024", size: "3.8 MB", desc: "Full operational and financial performance of the Office." },
  { title: "Schedule of Compensation Rates", year: "2026", size: "640 KB", desc: "Current statutory rates and entitlements." },
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

export const CLAIM_FAQS = [
  {
    q: "Who can lodge a workers compensation claim?",
    a: "Any worker employed under a contract of service in Papua New Guinea who suffers a personal injury by accident arising out of, or in the course of, their employment may lodge a claim under the Workers Compensation Act 1978. Dependants may also claim in the event of a work-related death.",
  },
  {
    q: "How soon must I report a workplace injury?",
    a: "Notice of the injury should be given to your employer as soon as practicable. Employers must notify the Office of Workers Compensation within 7 days of becoming aware of a workplace injury or illness.",
  },
  {
    q: "What documents do I need to submit?",
    a: "You will generally need a completed Worker's Application for Compensation (WC-1), a Medical Practitioner's First Report (MED-1), evidence of employment and wages, and any supporting documents such as witness statements or incident photographs.",
  },
  {
    q: "Is there a cost to lodge a claim?",
    a: "No. Lodging a workers compensation claim with the Office of Workers Compensation is free of charge. Be cautious of any third party requesting payment to process your claim.",
  },
  {
    q: "How long does a determination take?",
    a: "Straightforward claims are typically determined within 30–45 days of receiving all required documents. Complex claims involving permanent incapacity or dependant entitlements may take longer.",
  },
  {
    q: "Can I track my claim online?",
    a: "Yes. Once your claim is registered you will receive a reference number (for example OWC-2026-XXXXXX). Use the Track a Claim service on this portal to view real-time status updates.",
  },
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
