# Handover Document — OWC PNG Portal

A concise operational handover for the team taking ownership of the system.

## 1. What this is
A TOR-compliant, production-ready portal + CMS for the Office of Workers
Compensation (PNG), built on Next.js 15, Supabase and a CPPS-ready claims
integration. It runs with live Supabase credentials and degrades to bundled seed
data when integrations are absent.

## 2. Repository & tech
- Repo: `https://github.com/emabi2002/owc.git`
- Stack: Next.js 15 (App Router), React 18, TypeScript, Tailwind, shadcn/ui,
  Supabase, Zod, Bun, Biome.

## 3. Project structure (key paths)
```
src/
├─ app/
│  ├─ (public)/         Public pages (home, about, claims, employers, reports,
│  │                    publications, legislation, tenders, news, faqs, contact, search)
│  ├─ admin/login       Supabase-authenticated sign-in (+ MFA)
│  ├─ admin/(dashboard) Console: dashboard, content, claims, audit, users, settings
│  └─ api/              Route handlers (auth, enquiries, claims, employers, injuries)
├─ components/          UI + feature components (resources/, admin/, search/, …)
└─ lib/
   ├─ env.ts            Centralised env + capability flags
   ├─ supabase/         client / server / admin / middleware / types
   ├─ db/               schema.sql + seed.ts (fallback data)
   ├─ data/             Data access layer (content, cms, audit, search) + types
   ├─ cpps/             CPPS REST/GraphQL client + types
   ├─ auth/             roles (RBAC) + session helpers
   ├─ security/         validation (zod), rate-limit, captcha verify
   └─ actions/          server actions (content workflow)
scripts/setup-supabase.ts   Provision admin user, role, seed
deploy/                 nginx.conf, owc.service
docs/                   Deployment, API, Security, UAT, this handover
```

## 4. Environments & secrets
- Configure via `.env.local` (git-ignored). See `README.md §2` for the full list.
- `NEXT_PUBLIC_*` are build-time; server secrets (service-role, CPPS, CAPTCHA
  secret) are runtime-only and never sent to the browser.
- **Rotate the bootstrap admin password** (set during `bun run setup`) after the
  first sign-in, and store production secrets in your secret manager / host env.

## 5. First-time setup (live)
1. Run `src/lib/db/schema.sql` in Supabase (SQL editor).
2. `bun install && bun run setup` (creates admin + role + seed).
3. `bun run build && bun run start` (or deploy per the Ubuntu guide).

## 6. Day-to-day operations
- **Content**: staff sign in → Content → use the Draft→Submitted→Approved→
  Published workflow. Published items appear on the public site (ISR, ~60s).
- **Users & roles**: Administrators manage roles in Supabase (`profiles.role`)
  or the Users page; the matrix is in `src/lib/auth/roles.ts`.
- **Audit**: every privileged action is logged (Admin → Audit logs).
- **Claims**: tracking/lodgement proxy to CPPS; configure `CPPS_*` to go live.

## 7. Updating production
```bash
cd /var/www/owc && git pull --ff-only
bun install --frozen-lockfile && bun run build
pm2 reload ecosystem.config.js --update-env
```
Or push to `main` with `DEPLOY_*` GitHub secrets set (CI deploys over SSH).

## 8. Monitoring & backups
- Logs: `pm2 logs owc-png` / `journalctl -u owc -f`; Nginx logs in `/var/log/nginx`.
- Supabase: enable Point-in-Time Recovery; review auth + audit logs regularly.

## 9. Known follow-ups / roadmap
- Rich-text editor for content bodies (hook into Content "New content").
- Wire real file storage (Supabase Storage) for form/publication/tender files.
- Distributed rate limiting (Upstash) for multi-instance scaling.
- Email notifications for enquiries and workflow transitions (SMTP/Resend).
- Regenerate `supabase/types.ts` from the live schema after any DB change.

## 10. Support
- Technical docs: `docs/` and inline code comments.
- Same platform support: `support@same.new`.
