# Office of Workers Compensation (OWC) — Papua New Guinea

The official web portal of the **Office of Workers Compensation (OWC)**, under the
**Ministry of Labour & Employment**, Independent State of Papua New Guinea.

Built to support fair, timely and transparent administration of workers
compensation under the **Workers Compensation Act 1978** — for injured workers,
their dependants, and employers.

> This repository contains the front-end implementation (UI, public site and a
> secure admin/CMS console with mock data). It is structured so that a real
> backend (PostgreSQL / Supabase) and authentication can be wired in next.

---

## Features

### Public website
- **Home** — hero, quick links, claim process, statistics, news, security band
- **About OWC** — mandate, functions, governance & structure, the Ministry
- **Claims Services** — secure online lodgement form, claim tracker, required documents, FAQs
- **Employer Services** — registration, obligations, injury reporting, compensation process
- **Reports & Statistics** — KPI snapshot, SVG charts, OHS resources, downloadable reports
- **Forms & Downloads** — searchable, filterable document library
- **News & Public Notices** — listing + article detail pages
- **Contact & Enquiry** — categorised enquiry form, map, emergency contacts

### Secure admin console / CMS
- Staff sign-in screen (2FA messaging, demo credentials pre-filled)
- Dashboard with KPIs, claims overview chart, approval queue & activity feed
- Content management with an approval workflow (Draft → Submitted → Approved → Published)
- Claims management, audit logs, users & role-based access control
- Settings: authentication, encryption, backup & recovery, compliance

### Built for government
- Formal navy / gold / grey identity with a custom Bird-of-Paradise seal
- Accessibility: skip links, focus styles, semantic structure
- CAPTCHA, encrypted-submission messaging, full audit trail
- Aligned with **PNG Government ICT, DICT, NICTA** and national cybersecurity expectations

---

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router)
- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Lucide](https://lucide.dev) icons
- [Bun](https://bun.sh) package manager · [Biome](https://biomejs.dev) for formatting

---

## Getting started

```bash
# install dependencies
bun install

# run the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `bun run dev`    | Start the development server         |
| `bun run build`  | Create a production build            |
| `bun run start`  | Run the production build             |
| `bun run lint`   | Type-check (`tsc`) + Next.js lint    |
| `bun run format` | Format the codebase with Biome       |

---

## Admin console

Visit **`/admin/login`** and click **Secure sign in** — demo credentials are
pre-filled. The console uses mock data from `src/lib/admin-data.ts`.

---

## Project structure

```
src/
├── app/
│   ├── (public)/        # public-facing pages (home, about, claims, …)
│   └── admin/           # login + (dashboard) CMS routes
├── components/          # shared + feature components, shadcn/ui
└── lib/
    ├── site-data.ts     # public content & mock data
    └── admin-data.ts    # admin/CMS mock data
```

---

## License

© Office of Workers Compensation, Independent State of Papua New Guinea.
All rights reserved.
