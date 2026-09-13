# OWC Drupal Content Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deterministically migrate OWC editorial/public content into Drupal, verify parity/idempotency, and make Drupal the authoritative public CMS behind the existing Next.js content boundary.

**Architecture:** Export existing Supabase/seed content into a canonical JSON migration document, import/upsert that document into Drupal using server/container-side tooling, validate source/target parity, then change runtime content-source policy to Drupal-authoritative with an explicit rollback switch. The browser/mobile application continues to consume OWC/Next.js interfaces rather than Drupal directly.

**Tech Stack:** Next.js 15, TypeScript 5.8, Bun tests, Drupal 11/Drush/PHP, JSON:API, Supabase/PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-09-13-drupal-content-migration-design.md`

## Global Constraints

- Cover bundles: news, page, form, report, faq, publication, legislation, tender.
- Preserve source editorial state; never promote a non-published source record to published.
- Migration must be repeatable and idempotent.
- Restricted claimant evidence must never enter Drupal.
- No Drupal/Supabase service secret may be exposed to browser code.
- Production public content must ultimately be Drupal-authoritative.

---

### Task 1: Canonical migration contracts and source inventory

**Files:**
- Create: `src/lib/drupal/migration/contracts.ts`
- Create: `src/lib/drupal/migration/normalize.ts`
- Create: `src/lib/drupal/migration/normalize.test.ts`
- Create: `docs/DRUPAL_CONTENT_MAPPING.md`

**Interfaces:**
- Produces `CanonicalContentRecord` and `CanonicalMigrationDocument`.
- Produces normalization helpers for existing OWC content item types.

- [ ] Write failing tests for status mapping, deterministic natural keys and bundle-specific field mapping.
- [ ] Implement migration contracts and normalization.
- [ ] Document source → Drupal fields for all eight bundles.
- [ ] Run focused tests and full test/type-check/build verification.

### Task 2: Repeatable exporter

**Files:**
- Create: `scripts/export-drupal-content.ts`
- Create: `src/lib/drupal/migration/export.ts`
- Create: `src/lib/drupal/migration/export.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `bun run drupal:export-content`.
- Writes canonical JSON to `drupal/migration/content-export.json` when requested.

- [ ] Test deterministic ordering and duplicate-key rejection.
- [ ] Export Supabase content when configured; otherwise export repository reference content.
- [ ] Include explicit source metadata and generated-at timestamp.
- [ ] Add script entry and verification tests.

### Task 3: Drupal idempotent importer

**Files:**
- Create: `drupal/scripts/import-content.php`
- Create: `drupal/scripts/import-content.sh`
- Create: `drupal/migration/README.md`
- Modify: `drupal/Dockerfile` only if needed to expose migration artifacts.

**Interfaces:**
- Consumes canonical migration JSON.
- Reports created/updated/skipped/failed counts per bundle.

- [ ] Validate document schema and supported bundles.
- [ ] Upsert by deterministic natural key/migration metadata.
- [ ] Preserve moderation state.
- [ ] Fail non-zero on malformed records/import failures.
- [ ] Verify second import creates no duplicate records.

### Task 4: Parity validation

**Files:**
- Create: `drupal/scripts/verify-content-migration.php`
- Create: `drupal/scripts/verify-content-migration.sh`
- Create: `src/lib/drupal/migration/parity.test.ts`

**Interfaces:**
- Compares canonical source counts/keys with Drupal target counts/keys.

- [ ] Verify all expected bundles.
- [ ] Verify counts and deterministic keys.
- [ ] Verify representative field mappings and moderation states.
- [ ] Emit actionable mismatch report and fail non-zero on variance.

### Task 5: Authoritative Drupal content policy

**Files:**
- Modify: `src/lib/data/content.ts`
- Modify: `src/lib/drupal/content.ts`
- Modify: `src/lib/env.ts`
- Modify/add focused tests around content-source policy.
- Modify: `.env.example`

**Interfaces:**
- `CONTENT_SOURCE=drupal` means Drupal is authoritative and does not silently fall back to Supabase.
- Explicit transitional/rollback mode remains separately configurable.

- [ ] Write tests proving Drupal-authoritative mode fails closed to the content-service boundary.
- [ ] Preserve explicit migration/rollback fallback mode.
- [ ] Ensure server-only Drupal credentials remain server-only.
- [ ] Run full test/lint/build verification.

### Task 6: End-to-end clean-room migration verification and PR

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `docs/DRUPAL_STEP1_ACCEPTANCE.md` or create migration acceptance document.

**Interfaces:**
- CI reconstructs Drupal, exports reference content, imports it, re-imports it, validates parity, then runs Next.js tests/build.

- [ ] Add clean-room migration CI job.
- [ ] Prove first import succeeds.
- [ ] Prove second import is idempotent.
- [ ] Prove parity verification passes.
- [ ] Run branch-head CI and inspect exact result.
- [ ] Open draft PR only after fresh verification evidence.
