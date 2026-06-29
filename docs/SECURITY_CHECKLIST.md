# Security Checklist

Security posture of the OWC PNG portal, mapped to the **OWASP Top 10 (2021)**.
Use this as a pre-go-live review and a periodic audit.

## OWASP Top 10 mapping

| # | Risk | Mitigation in this project |
| --- | --- | --- |
| A01 | Broken Access Control | RBAC matrix (`src/lib/auth/roles.ts`); server-side `requirePermission`; middleware guards `/admin`; Supabase **RLS** on every table. |
| A02 | Cryptographic Failures | TLS 1.2/1.3 at Nginx; HSTS; Supabase encryption at rest; secrets only in `.env.local` (git-ignored). |
| A03 | Injection | Zod validation + `sanitizeText` on all inputs (`src/lib/security/validation.ts`); parameterised PostgREST queries; no string-built SQL. |
| A04 | Insecure Design | Rate limiting (`src/lib/security/rate-limit.ts`); CAPTCHA on public forms; least-privilege keys (anon vs service-role). |
| A05 | Security Misconfiguration | Security headers in `next.config.js` + Nginx; `poweredByHeader:false`; preview-only scripts excluded in production. |
| A06 | Vulnerable Components | Pinned deps; `bun install --frozen-lockfile`; update via Dependabot/`bun update`. |
| A07 | Identification & Auth Failures | Supabase Auth; MFA-ready (TOTP challenge); login rate-limited; failed logins audited. |
| A08 | Software & Data Integrity | CI builds from locked deps; append-only `audit_logs`; signed Git history. |
| A09 | Logging & Monitoring | Audit log for create/update/delete/approve/publish/login/failed_login/role_change; PM2/journald logs. |
| A10 | SSRF | CPPS calls go only to the configured base URL with a fixed timeout; no user-controlled outbound URLs. |

## Headers
- Application: `Strict-Transport-Security`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, CSP `frame-ancestors`/`object-src`/
  `base-uri`/`form-action` (`next.config.js`).
- Edge (production): full CSP, `X-Frame-Options: SAMEORIGIN` in `deploy/nginx.conf`.

## Secrets
- [ ] No secrets committed (`git grep` for keys; `.env*` ignored).
- [ ] Service-role key only used server-side (`src/lib/supabase/admin.ts`).
- [ ] Rotate the bootstrap admin password after first login.
- [ ] CI/CD secrets stored in GitHub Actions / host env, never in the repo.

## Authentication & authorisation
- [ ] MFA enrolled for all Administrator accounts (Supabase Auth → MFA).
- [ ] RLS enabled and tested for anon vs each role.
- [ ] Session cookies are HttpOnly/Secure (handled by `@supabase/ssr`).

## Forms & abuse prevention
- [ ] CAPTCHA provider configured for production (`turnstile`/`recaptcha`/`hcaptcha`).
- [ ] Rate limits verified (login 5/min, enquiries/lodgement 5/min).
- [ ] File-upload size capped at the proxy (`client_max_body_size`).

## Network / infrastructure
- [ ] UFW allows only SSH + Nginx Full.
- [ ] TLS A+ (test on SSL Labs); auto-renewal active.
- [ ] Distributed rate limiting (Upstash) if running multiple instances.

## Data protection & compliance
- [ ] Aligned with PNG Government ICT / DICT / NICTA expectations.
- [ ] Backups + Point-in-Time Recovery enabled in Supabase.
- [ ] Audit-log retention policy documented (target: 7 years).
- [ ] Privacy notice and data-handling statement published.
