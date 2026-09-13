# Drupal Enterprise CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provision a repeatable Drupal DEV/UAT stack for OWC, bootstrap the required editorial content model, roles and moderation workflow, expose controlled JSON:API content, and document verification for the Next.js integration.

**Architecture:** Drupal is deployed as a separate headless CMS service backed by PostgreSQL. Configuration is bootstrapped with Drush so DEV/UAT can be rebuilt deterministically; Next.js continues to consume only published public content through its existing server-side Drupal adapter. Restricted claims, medical evidence, banking data and compensation documents remain outside Drupal.

**Tech Stack:** Drupal 11, PHP 8.3+, PostgreSQL 16, Drush, Docker Compose, JSON:API, Drupal Content Moderation/Workflows, Next.js existing adapter.

**Spec:** `docs/DRUPAL_INTEGRATION.md`

## Global Constraints

- Drupal owns editorial/public content only.
- Next.js remains the digital experience/application layer.
- Supabase/PostgreSQL remains portal identity/application/audit support during migration.
- CPPS remains the authoritative claims/payment system until formal discovery establishes otherwise.
- Restricted claims, medical evidence, banking information and compensation documents must not be stored in Drupal.
- Public Next.js reads only published Drupal content.
- Configuration changes move DEV -> UAT -> PROD; no direct production configuration edits.
- No real credentials or secrets are committed.

---

### Task 1: Isolated Drupal deployment stack

**Files:**
- Create: `drupal/docker-compose.yml`
- Create: `drupal/.env.example`
- Create: `drupal/README.md`

**Interfaces:**
- Produces: local DEV/UAT Drupal endpoint, PostgreSQL persistence, Drush-capable Drupal container.

- [ ] Create a Docker Compose stack with `drupal` and `postgres` services, persistent named volumes, health checks, and environment variables loaded from `drupal/.env`.
- [ ] Pin supported major versions and expose Drupal only through a configurable host port.
- [ ] Add `.env.example` containing database name/user/password placeholders, site host/port, admin bootstrap identity and trusted host patterns.
- [ ] Document startup, shutdown, reset and log commands.
- [ ] Validate Compose syntax with `docker compose -f drupal/docker-compose.yml config` in an environment with Docker available.

### Task 2: Deterministic Drupal bootstrap

**Files:**
- Create: `drupal/scripts/bootstrap.sh`
- Create: `drupal/scripts/verify.sh`

**Interfaces:**
- Consumes: running Drupal/PostgreSQL stack from Task 1.
- Produces: installed Drupal site with required core modules and repeatable verification output.

- [ ] Write bootstrap script that waits for PostgreSQL, installs Drupal if not already installed, enables `jsonapi`, `serialization`, `workflows`, `content_moderation`, `media`, `media_library`, `file`, `image`, and `options`.
- [ ] Configure site name and JSON:API read-only policy for public content.
- [ ] Make bootstrap idempotent: repeated execution must not recreate the site or duplicate content model objects.
- [ ] Add verify script that checks Drupal status, enabled modules and JSON:API availability.

### Task 3: Editorial content model

**Files:**
- Create: `drupal/scripts/content-model.sh`
- Create: `drupal/config/content-model.md`

**Interfaces:**
- Produces Drupal content types: `news`, `form`, `report`, `faq`, `publication`, `legislation`, `tender`, `page` with the machine names expected by the Next.js adapter.

- [ ] Create the eight required content types with human-readable labels.
- [ ] Add the required `field_*` fields referenced by `src/lib/drupal/content.ts`.
- [ ] Configure field storage types conservatively: plain text/string, long text, boolean, integer/date as appropriate, and public URL/file reference fields where the current adapter expects them.
- [ ] Make the script idempotent by checking for bundles/fields before creation.
- [ ] Document the field matrix and its mapping to the existing Next.js public domain types.

### Task 4: Taxonomy and editorial governance

**Files:**
- Create: `drupal/scripts/governance.sh`
- Create: `drupal/config/governance.md`

**Interfaces:**
- Produces: moderation states `draft`, `review`, `approved`, `published`, `archived`; roles `cms_administrator`, `content_editor`, `reviewer`, `publisher`, `auditor`.

- [ ] Create workflow and moderation transitions matching Draft -> Review -> Approved -> Published -> Archived.
- [ ] Attach moderation to the eight editorial content types.
- [ ] Create roles and assign least-privilege permissions for authoring, review, publishing and read-only audit.
- [ ] Ensure anonymous access can view published content only and cannot mutate content through JSON:API.
- [ ] Document role responsibilities and approval boundaries.

### Task 5: Public API hardening and sample verification

**Files:**
- Create: `drupal/scripts/sample-content.sh`
- Modify: `drupal/scripts/verify.sh`
- Modify: `docs/DRUPAL_INTEGRATION.md`

**Interfaces:**
- Produces: published sample records and verifiable JSON:API endpoints consumed by the existing Next.js adapter.

- [ ] Create one safe sample record for `news`, `form`, and `page` only when absent.
- [ ] Verify JSON:API returns published nodes and excludes unpublished nodes from anonymous reads.
- [ ] Verify expected machine-name fields appear in API output.
- [ ] Document exact API endpoint examples and environment variables required by Next.js.

### Task 6: CI/static validation for Drupal assets

**Files:**
- Create: `scripts/validate-drupal-config.mjs`
- Create: `src/lib/drupal/bootstrap-config.test.ts`
- Modify: `.github/workflows/deploy.yml`
- Modify: `package.json`

**Interfaces:**
- Produces: CI guard that verifies required Drupal content types, workflow states, roles, scripts and Compose configuration are represented consistently in repository configuration.

- [ ] Write a failing test asserting the required eight content types, five moderation states and five roles are present in Drupal bootstrap configuration.
- [ ] Implement a small machine-readable manifest or parser used by the test and bootstrap scripts.
- [ ] Add static validation for Docker Compose YAML presence/required services without requiring Docker on CI runners.
- [ ] Run `bun test`, `bun run lint`, and `bun run build`.
- [ ] Commit only after all repository CI checks are green.

### Task 7: Step-1 acceptance review

**Files:**
- Modify: `docs/DRUPAL_INTEGRATION.md`
- Create: `docs/DRUPAL_STEP1_ACCEPTANCE.md`

**Interfaces:**
- Produces: explicit evidence checklist separating repository-complete work from external DEV/UAT infrastructure actions.

- [ ] Confirm each requirement in `docs/DRUPAL_INTEGRATION.md` has an implemented configuration path.
- [ ] Record what is executable immediately from the repository.
- [ ] Record external prerequisites still required for a real DEV/UAT deployment: Ubuntu/Docker host, DNS/TLS, production-grade secrets, SMTP/SSO if selected.
- [ ] Record exact commands OWC administrators use to provision and verify Drupal.
- [ ] Do not mark Drupal production-deployed until a real environment is provisioned and verified.
