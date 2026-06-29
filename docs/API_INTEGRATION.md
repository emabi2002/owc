# API & Integration Guide

How the OWC portal integrates with **Supabase** (Auth + PostgreSQL) and the
**CPPS** claims back-end, plus the internal HTTP API.

## Architecture

```
Browser ──▶ Next.js (App Router)
                │
                ├─ Data access layer  src/lib/data/*  ──▶ Supabase (PostgREST)
                │      (falls back to src/lib/db/seed.ts when unconfigured)
                │
                ├─ CPPS client        src/lib/cpps/api.ts ──▶ CPPS REST / GraphQL
                │      (falls back to mock responses when unconfigured)
                │
                └─ Route handlers     src/app/api/*  (rate-limited, validated)
```

Everything degrades gracefully: missing credentials → bundled seed/mock data, so
the site is always buildable and demonstrable.

## Supabase

- Clients: `src/lib/supabase/client.ts` (browser), `server.ts` (cookie-bound
  server), `admin.ts` (service-role), `middleware.ts` (session refresh).
- Types: `src/lib/supabase/types.ts` (regenerate with
  `supabase gen types typescript --project-id <id>`).
- Schema + RLS: `src/lib/db/schema.sql`.
- Tables: `pages, news, publications, legislation, tenders, faqs, forms,
  reports, enquiries, profiles, audit_logs, claim_tracking`.
- RLS: anonymous users read only `published` rows; staff manage per role;
  `enquiries` accept anonymous inserts; `audit_logs` are staff-readable and
  written via the service role.

## CPPS (Compensation Processing & Payment System)

Client: `src/lib/cpps/api.ts`. Configure with `CPPS_API_BASE_URL`,
`CPPS_API_KEY`, and optionally `CPPS_GRAPHQL_ENDPOINT`.

| Function | Transport | Used by |
| --- | --- | --- |
| `getClaimStatus(ref, surname?)` | `GET /claims/:ref/status` | `/api/claims/track` |
| `checkEmployerRegistration(q)` | `GET /employers/verify?q=` | `/api/employers/verify` |
| `submitClaimLodgement(input)` | `POST /claims` | `/api/claims/lodge` |
| `reportWorkplaceInjury(input)` | `POST /injuries` | `/api/injuries` |
| `submitEnquiry(input)` | `POST /enquiries` | `/api/enquiries` |

- Auth headers: `Authorization: Bearer <CPPS_API_KEY>` and `X-API-Key`.
- A GraphQL helper `cppsGraphQL(query, variables)` is provided for endpoints that
  prefer GraphQL.
- All calls have a 10s timeout and return a discriminated
  `CppsResult<T>` (`source: "cpps" | "mock"`).

## Internal HTTP API (route handlers)

All POST. JSON in/out. Rate-limited per IP; inputs validated with Zod
(`src/lib/security/validation.ts`); CAPTCHA verified server-side where relevant.

| Endpoint | Limit | Body | Notes |
| --- | --- | --- | --- |
| `/api/enquiries` | 5/min | name,email,phone?,category,subject?,message,captchaToken | Persists to Supabase + CPPS |
| `/api/claims/track` | 20/min | reference, surname? | Returns `{found, claim}` |
| `/api/claims/lodge` | 5/min | worker/employer/injury fields, declaration, captchaToken | Returns `{reference}` |
| `/api/employers/verify` | 15/min | query | Registration status |
| `/api/injuries` | 5/min | employer/worker/injury fields, captchaToken | Employer injury report |
| `/api/admin/login` | 5/min | email, password | Supabase sign-in; audits login/failed_login |
| `/api/admin/mfa` | 6/min | factorId, code | TOTP challenge-and-verify |
| `/api/admin/logout` | — | — | Sign-out + audit |

### Example

```bash
curl -X POST https://owc.gov.pg/api/claims/track \
  -H 'Content-Type: application/json' \
  -d '{"reference":"OWC-2026-004821"}'
```

## Switching from mock to live
1. Set the Supabase env vars and run `schema.sql` + `bun run setup`.
2. Set `CPPS_API_BASE_URL` (+ key / GraphQL endpoint).
3. Rebuild (`NEXT_PUBLIC_*` are build-time) and restart.
No application code changes are required.
