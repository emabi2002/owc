# OWC PNG — TOR Compliance Upgrade

Transform the OWC site from prototype/mock-data into a TOR-compliant, production-ready system.

## Phase 1 — Foundation & Supabase
- [x] Add deps: @supabase/supabase-js, @supabase/ssr, zod
- [x] `src/lib/env.ts` — env access + isSupabaseConfigured / isCppsConfigured flags
- [x] `src/lib/supabase/client.ts` / `server.ts` / `admin.ts` / `middleware.ts` / `types.ts`
- [x] `src/lib/db/schema.sql` — full Postgres schema + RLS + enums + triggers
- [x] `.env.example` + `.env.local` (live Supabase credentials wired)

## Phase 2 — Data access layer (replaces mock data)
- [x] `src/lib/db/seed.ts` — seed/fallback content
- [x] `src/lib/data/*` — content, cms, audit, search, types
- [x] `site-data.ts` reduced to static config; `admin-data.ts` removed
- [x] Public pages/components refactored to consume the data layer

## Phase 3 — CPPS integration
- [x] `src/lib/cpps/types.ts` + `api.ts` (REST + GraphQL, mock fallback)

## Phase 4 — Auth & RBAC
- [x] roles + session + middleware; bootstrap admin elevation
- [x] Real Supabase Auth login (+ MFA step), logout, audit; demo login removed
- [x] Content workflow service Draft→Submitted→Approved→Published + audit

## Phase 5 — New public pages
- [x] /publications, /legislation, /tenders, /faqs, /search (CMS-driven, searchable)
- [x] Nav + footer updated

## Phase 6 — Site-wide search
- [x] `src/lib/data/search.ts` + /search with type & date filters; header wired

## Phase 7 — Security
- [x] Security headers in next.config.js (dynamic app, not static export)
- [x] rate-limit + validation (zod) + server captcha verify
- [x] API routes with rate limiting + validation
- [x] CAPTCHA integration-ready (Turnstile/reCAPTCHA/hCaptcha + fallback)

## Phase 8 — Deployment readiness
- [x] `.github/workflows/deploy.yml`
- [x] `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- [x] `deploy/nginx.conf`, `ecosystem.config.js`, `deploy/owc.service`, `netlify.toml`

## Phase 9 — Documentation
- [x] README + docs/DEPLOYMENT_UBUNTU_24_04, API_INTEGRATION, UAT_CHECKLIST, SECURITY_CHECKLIST, HANDOVER

## Phase 10 — A11y / perf + verify
- [x] Skip link, focus styles, form labels, aria-labels, lazy images
- [x] `bun run lint` ✓ · `bun run build` ✓ (30 routes)

## Phase 11 — Live Supabase (done)
- [x] `.env.local` wired with live Supabase credentials
- [x] `reset.sql` (clean-slate) + `schema.sql` applied in Supabase
- [x] `bun run setup` — admin user + administrator role + seeded content
- [x] Verified admin login + RLS (anon reads only published) against live DB
- [x] Verified real create → Draft → Submit → Approve → Publish → anon-visible
      news workflow, with audit-log persistence

## Maintenance
- [x] Restored `src/lib/db/schema.sql` (file was emptied during a context reset)
      — full schema mirrors `src/lib/supabase/types.ts`: 12 tables, 6 enums,
      updated_at + new-user triggers, `current_app_role()`/`is_staff()` helpers,
      38 RLS policies, grants. `bun run lint` ✓

## Remaining (requires user)
- [ ] None outstanding. Optional roadmap: rich-text editor for bodies, Supabase
      Storage for file uploads, email notifications, Upstash for distributed
      rate limiting (see docs/HANDOVER.md §9).
