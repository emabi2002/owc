# Office of Workers Compensation (OWC) — PNG Portal

Official portal and content-management system for the **Office of Workers
Compensation**, Ministry of Labour & Employment, Independent State of Papua New
Guinea. Built to the OWC Website Terms of Reference.

- **Public portal** — Home, About, Claims (lodge/track), Employers, Reports &
  Data, Publications, Legislation, Tenders, News, FAQs, Contact and site-wide
  Search.
- **Admin / CMS** — Supabase-authenticated console with role-based access,
  editorial workflow (Draft → Submitted → Approved → Published), claims,
  audit logs, users & roles, and settings.
- **Integrations** — Supabase (Auth + PostgreSQL) and a CPPS claims back-end
  (REST + GraphQL ready). Both are environment-configurable and degrade
  gracefully to bundled seed data when not configured.

## Tech stack

Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS · shadcn/ui ·
Supabase · Zod · Bun · Biome.

---

## 1. Quick start (local)

```bash
bun install
cp .env.example .env.local      # then fill in values (see §2)
bun run dev                      # http://localhost:3000
```

Without any credentials the site runs in **demo mode** using `src/lib/db/seed.ts`.

Scripts:

| Command | Description |
| --- | --- |
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run start` | Run the production server |
| `bun run lint` | Type-check (`tsc`) + ESLint |
| `bun run setup` | Provision Supabase (admin user, role, seed) |

---

## 2. Environment variables

Copy `.env.example` → `.env.local`. `.env*` is git-ignored — **never commit secrets**.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server** | Privileged key (audit writes, provisioning) |
| `OWC_BOOTSTRAP_ADMIN_EMAILS` | server | Emails auto-treated as Administrator |
| `CPPS_API_BASE_URL` | server | CPPS REST base URL |
| `CPPS_API_KEY` | server | CPPS API key |
| `CPPS_GRAPHQL_ENDPOINT` | server | CPPS GraphQL endpoint |
| `NEXT_PUBLIC_CAPTCHA_PROVIDER` | public | `fallback` / `turnstile` / `recaptcha` / `hcaptcha` |
| `NEXT_PUBLIC_CAPTCHA_SITE_KEY` | public | CAPTCHA site key |
| `CAPTCHA_SECRET_KEY` | server | CAPTCHA secret (server verification) |

> `NEXT_PUBLIC_*` values are inlined at **build time** — set them before building
> (and as Docker build args / CI secrets for production).

---

## 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and copy the URL +
   keys into `.env.local`.
2. Open **SQL Editor** and run [`src/lib/db/schema.sql`](src/lib/db/schema.sql).
   This creates all tables, enums, the `profiles` table, the audit log, the
   `updated_at` triggers, the new-user trigger and **Row Level Security**
   policies (public can read only `published` content; staff manage per role).
   > Re-provisioning / clean slate? Run [`src/lib/db/reset.sql`](src/lib/db/reset.sql)
   > first (drops all app tables/types/functions — auth users are kept), then
   > run `schema.sql`.
3. Provision the admin user, role and demo content:
   ```bash
   bun run setup
   ```
   Prints the bootstrap administrator credentials. **Change the password after
   first login.**

Data access lives in `src/lib/data/*` — every reader queries Supabase when
configured and falls back to seed data otherwise, so the UI never depends on raw
rows.

---

## 4. CPPS integration

The claims back-end client is `src/lib/cpps/api.ts` (REST + GraphQL helpers).
Service functions: `getClaimStatus`, `checkEmployerRegistration`,
`submitClaimLodgement`, `reportWorkplaceInjury`, `submitEnquiry`. Set
`CPPS_API_BASE_URL` (and optionally `CPPS_GRAPHQL_ENDPOINT`) to go live; until
then realistic mock responses are returned. See
[`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md).

---

## 5. Admin roles & CMS workflow

Sign in at `/admin/login` (Supabase Auth, MFA-ready).

**Roles:** Administrator · Editor · Reviewer · Claims Officer · Viewer
(matrix in `src/lib/auth/roles.ts`).

**Editorial workflow:** Draft → Submitted → Approved → Published (+ Archived),
enforced by `src/lib/data/cms.ts` and the server actions in
`src/lib/actions/content.ts`. Every create/update/delete/approve/publish/login/
failed-login/role-change is written to the **audit log**.

---

## 6. Production deployment

- **Ubuntu 24.04 + Nginx + PM2/systemd** — see
  [`docs/DEPLOYMENT_UBUNTU_24_04.md`](docs/DEPLOYMENT_UBUNTU_24_04.md).
- **Docker** — `docker compose up -d --build` (pass `NEXT_PUBLIC_*` build args).
- **Netlify** — dynamic via `@netlify/plugin-nextjs` (`netlify.toml`).
- **CI/CD** — `.github/workflows/deploy.yml` (install → lint → type-check →
  build → optional SSH deploy).

---

## 7. Further documentation

- [`docs/DEPLOYMENT_UBUNTU_24_04.md`](docs/DEPLOYMENT_UBUNTU_24_04.md)
- [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md)
- [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md)
- [`docs/UAT_CHECKLIST.md`](docs/UAT_CHECKLIST.md)
- [`docs/HANDOVER.md`](docs/HANDOVER.md)

---

© Office of Workers Compensation, Independent State of Papua New Guinea.
