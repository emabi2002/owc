# OWC Management Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a management-only reporting workspace with a canonical `management` role, server-side reporting permissions, deterministic demonstration reporting, protected source-data drill-down, and export capability.

**Architecture:** Extend the existing RBAC and demonstration identity boundaries rather than creating a second authentication system. Management reporting is served through protected server components/APIs. The bidding environment uses the existing 20-record synthetic demonstration claim pack; live mode reads the OWC PostgreSQL/Supabase reporting data path when configured. Management never receives operational mutation permissions merely by holding the reporting role.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript 5.8, Bun test, Zod, Supabase/PostgreSQL, existing shadcn/UI and OWC authentication/audit services.

**Spec:** `docs/superpowers/specs/2026-09-14-management-reporting-ai-assistants-design.md`

## Global constraints

- Canonical role value: `management`; display label: `Management / Executive`.
- Management reporting requires authenticated server-side permission checks.
- Public routes and ordinary staff roles must not inherit reporting access.
- The management role does not receive `claims.manage`, `claims.assess`, `payments.manage`, `users.manage`, or `settings.manage`.
- Demonstration data remains synthetic and must be labelled as such.
- Every code task starts with a failing Bun test/contract, then the minimum implementation, then verification.

---

### Task 1: Management role and reporting permissions

**Files:**
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/lib/data/types.ts`
- Modify: `src/lib/auth/roles.ts`
- Modify: `src/lib/auth/demo-identity.ts`
- Modify: `src/lib/auth/session.ts`
- Modify: `src/lib/data/cms.ts`
- Modify: `src/lib/db/seed.ts`
- Modify: `src/lib/db/schema.sql`
- Create: `src/lib/db/management-reporting-role-2026-09-14.sql`
- Modify: `src/lib/auth/demo-identity.test.ts`
- Modify: `src/lib/auth/demonstration-identity.contract.test.ts`
- Modify: `src/lib/auth/demonstration-identity-hardening.test.ts`

**Required contract:**
```ts
hasPermission("management", "reports.view") === true
hasPermission("management", "reports.ai.query") === true
hasPermission("management", "claims.manage") === false
hasPermission("claims_officer", "reports.view") === false
```

- [ ] Write failing tests for the new role, four report permissions, absence of operational mutation permissions, and a sixth staff demonstration persona.
- [ ] Run CI on the failing commit and verify RED for the intended missing-role assertions.
- [ ] Add `management` to `AppRole`, labels/values, and `ALL_ROLES`; add `reports.view`, `reports.export`, `reports.ai.query`, `reports.source_data.view` permissions only for `management`.
- [ ] Add a synthetic Management / Executive demonstration persona with MFA and reporting-only scopes; update demo session authorization-denial persona mapping.
- [ ] Add the fresh-schema enum value and idempotent upgrade migration without granting management raw claim mutation rights.
- [ ] Align staff/role display data so Management / Executive is represented correctly.
- [ ] Re-run targeted auth/RBAC tests and commit as `feat: add management reporting role`.

### Task 2: Reporting domain and deterministic aggregation

**Files:**
- Create: `src/lib/reporting/types.ts`
- Create: `src/lib/reporting/service.test.ts`
- Create: `src/lib/reporting/service.ts`
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/lib/db/schema.sql`
- Create: `src/lib/db/management-reporting-data-2026-09-14.sql`

**Interfaces:**
```ts
type ManagementReportRequest = {
  report: "executive" | "province" | "employer" | "aging" | "category" | "turnaround" | "payments";
  from?: string;
  to?: string;
  province?: string;
  employer?: string;
  status?: string;
};

buildManagementReport(rows, request): ManagementReportResult
```

- [ ] Write failing pure-unit tests using the 20-record demonstration pack for total counts, province grouping, employer grouping, aging bands, turnaround, status counts, and illustrative payment totals.
- [ ] Confirm RED because the reporting domain does not exist.
- [ ] Implement normalized reporting rows and deterministic filter/aggregation functions. Date filters are inclusive at both ends and documented in code.
- [ ] Extend the reporting data shape with optional province, district, industry, occupation, decision, compensation amount, turnaround, notification/payment state and assigned officer fields; preserve compatibility with existing claim lodgement.
- [ ] Add an idempotent database migration for the new optional reporting columns and indexes.
- [ ] Verify report totals reconcile exactly with the source rows and commit as `feat: add management reporting data service`.

### Task 3: Server reporting source and audit boundary

**Files:**
- Create: `src/lib/reporting/source.test.ts`
- Create: `src/lib/reporting/source.ts`
- Create: `src/lib/reporting/audit.ts`

**Behavior:**
- demonstration identity -> deterministic synthetic claim pack;
- live identity with configured Supabase -> read-only claim-reporting rows;
- no configured live data source -> explicit unavailable result, not synthetic production-looking data.

- [ ] Write failing tests for demonstration-source labelling and fail-closed live-source behaviour.
- [ ] Implement the source adapter and mapping; do not expose a write-capable client through the reporting interface.
- [ ] Add report access/generation/export/source-drilldown audit helpers using the existing append-only audit service.
- [ ] Verify source metadata includes `syntheticData`, `environment`, and record count and commit as `feat: add protected reporting source`.

### Task 4: Protected Management / Executive portal

**Files:**
- Create: `src/components/management/management-shell.tsx`
- Create: `src/app/management/login/page.tsx`
- Create: `src/app/management/(portal)/layout.tsx`
- Create: `src/app/management/(portal)/page.tsx`
- Create: `src/app/management/(portal)/reports/page.tsx`
- Modify: `src/app/admin/login/page.tsx`
- Create: `src/lib/reporting/management-access.contract.test.ts`

- [ ] Write a failing source-contract test requiring `/management/login`, a portal layout calling `requirePermission("reports.view")`, and the admin sign-in redirect whitelist to accept safe `/management/...` targets.
- [ ] Confirm RED.
- [ ] Add `/management/login` as the dedicated management entry point while reusing the existing secure staff authentication/MFA provider.
- [ ] Add a management shell distinct from the public UI and ordinary admin navigation.
- [ ] Add executive KPI cards, report selector/filter controls, grouped tables, demonstration disclosure, and source-data drill-down using only the server reporting service.
- [ ] Ensure unauthenticated users go to login and authenticated non-management users are denied server-side.
- [ ] Verify the access contract and commit as `feat: add protected management reporting portal`.

### Task 5: Report exports

**Files:**
- Create: `src/lib/reporting/export.test.ts`
- Create: `src/lib/reporting/export.ts`
- Create: `src/app/api/management/reports/export/route.ts`
- Create: `src/components/management/report-export-actions.tsx`

**Interfaces:**
- CSV: UTF-8 CSV with report metadata header + rows.
- Spreadsheet: Excel-compatible tabular download without adding a heavy workbook dependency in the bidding release.
- PDF: browser print/save-PDF presentation with print stylesheet and generated report metadata.

- [ ] Write failing tests that CSV/spreadsheet outputs contain the same record count and authoritative totals as the in-memory report result.
- [ ] Confirm RED.
- [ ] Implement server-side export serialization and route-level `reports.export` authorization.
- [ ] Add `Print / Save PDF`, `CSV`, and `Excel` actions to the report page.
- [ ] Audit each export with report ID and filters, without logging unnecessary claimant-sensitive values.
- [ ] Verify targeted tests and commit as `feat: add management report exports`.

### Task 6: Phase verification

- [ ] Run the full Bun test suite, reference UAT, demonstration UAT, terminology check, release rehearsal, type-check/lint, Next.js production build, and Drupal clean-room workflow through GitHub Actions on the exact branch head.
- [ ] Review the PR diff for public-route leakage, mutation permissions and demonstration terminology.
- [ ] Do not mark the reporting phase complete unless the exact-head CI is green.