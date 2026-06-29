# User Acceptance Testing (UAT) Checklist

Sign-off checklist for the OWC PNG portal. Test on desktop and mobile, in a
current Chrome/Edge/Firefox/Safari.

Environment: ☐ Local ☐ Staging ☐ Production — Tester: ____________ Date: ________

## 1. Public site — navigation & pages
- [ ] Header, mega-menu and mobile menu work; all links resolve.
- [ ] Pages load (200): Home, About, Claims, Employers, Reports, Publications,
      Legislation, Tenders, News, FAQs, Contact, Search.
- [ ] News listing + individual article pages render.
- [ ] Footer links resolve; tricolour + emblem display correctly.

## 2. Claims
- [ ] **Track a claim**: `OWC-2026-004821` returns a status timeline.
- [ ] Unknown reference shows a friendly "not found" message.
- [ ] **Lodge a claim**: validation blocks empty required fields.
- [ ] CAPTCHA must be completed; declaration required; success shows a reference.

## 3. Forms / Publications / Legislation / Tenders / FAQs
- [ ] Category/status filters and on-page search work on each.
- [ ] Tender statuses (Open/Closing soon/Closed/Awarded) display correctly.
- [ ] Download/View actions behave (open file or show "available shortly").

## 4. Site-wide search
- [ ] `/search` returns results across content types.
- [ ] Filter by content type and by year works; mobile layout is usable.
- [ ] Empty query and no-results states display.

## 5. Contact & enquiries
- [ ] Enquiry form validates, requires category + CAPTCHA, returns a reference.
- [ ] (Live Supabase) Enquiry row appears in the `enquiries` table.

## 6. Admin authentication
- [ ] `/admin` redirects to `/admin/login` when signed out.
- [ ] Valid Supabase credentials sign in; invalid show an error (no app crash).
- [ ] Failed login is recorded in the audit log.
- [ ] MFA step appears for MFA-enrolled accounts and verifies a TOTP code.
- [ ] Sign-out returns to the login page and clears the session.

## 7. Admin console & RBAC
- [ ] Dashboard shows stats, approval queue, recent claims, activity.
- [ ] Content workflow: Draft → Submit → Approve → Publish updates status.
- [ ] "Return" sends an item back to Draft; "Archive" works; delete (admin only).
- [ ] Viewer/Claims Officer cannot reach Content/Users (redirected).
- [ ] Claims, Audit and Users pages load and filter/search.

## 8. Integrations
- [ ] With Supabase configured, public pages show DB content (after seeding).
- [ ] Without CPPS, claim tracking returns mock data (`source: mock`).
- [ ] With CPPS configured, live claim status is returned.

## 9. Security
- [ ] HTTPS enforced; HSTS present; security headers verified.
- [ ] Rapid repeated submissions are rate-limited (HTTP 429).
- [ ] No secrets exposed in client bundle/network (check devtools).

## 10. Accessibility (WCAG 2.1 AA)
- [ ] Keyboard-only navigation reaches all controls; visible focus.
- [ ] "Skip to main content" link works.
- [ ] Form fields have labels; errors are announced.
- [ ] Colour contrast passes; headings are in logical order.

## 11. Performance
- [ ] Lighthouse (desktop) ≥ 85; (mobile) ≥ 75.
- [ ] Images lazy-load; no layout shift on hero/news cards.

## 12. Build & deployment
- [ ] `bun install`, `bun run lint`, `bun run build` all pass.
- [ ] Git pull → build → reload update works on the server.

---
**Result:** ☐ Pass ☐ Pass with notes ☐ Fail  Signature: ______________________
