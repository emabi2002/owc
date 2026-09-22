# Persistent Multi-Agency Demonstration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the existing OWC multi-agency demonstration in the supplied Supabase project without changing the user experience.

**Architecture:** Private PostgreSQL schemas model OWC, NID, IPA, IRC, health, insurance, employment, banking, integration and audit silos. Narrow `SECURITY INVOKER` RPC functions granted only to `service_role` provide the existing Next.js routes with durable lookups, telemetry and simulated payments; existing in-memory implementations remain test fixtures and an explicit local fallback.

**Tech Stack:** PostgreSQL/Supabase, Supabase Storage, Next.js 15 route handlers, TypeScript, `@supabase/supabase-js`, Zod, Bun test.

**Spec:** `docs/superpowers/specs/2026-09-22-persistent-multi-agency-demonstration-design.md`

## Global Constraints

- Do not change existing pages, routes, forms, dashboards or layout.
- Do not commit credentials or place a secret key in a `NEXT_PUBLIC_` variable.
- Use synthetic records only and preserve explicit demonstration terminology.
- Payment remains simulated with database-enforced `money_movement = false`.
- Agency schemas are not granted to `anon` or `authenticated`.
- Existing API paths and response fields remain compatible.
- Database-backed mode fails closed; it never silently substitutes static data.

## Review Focus

- Database-backed mode enabled without server credentials must return a bounded unavailable response, never static success.
- An identifier containing whitespace or lowercase characters must normalize identically to the existing API.
- A valid identifier belonging to a different scenario/person must fail cross-agency coherence.
- Repeating the same simulated-payment idempotency key must return the original transaction.
- Database errors must not expose SQL, credentials, medical data or banking payloads.

---

### Task 1: Current Supabase key configuration

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `src/lib/supabase/client.ts`
- Modify: `src/lib/supabase/server.ts`
- Modify: `src/lib/supabase/admin.ts`
- Modify: `.env.example`
- Modify: `netlify.toml`
- Test: `src/lib/supabase/key-configuration.test.ts`

**Interfaces:**
- Produces: `publicEnv.supabasePublishableKey`, `serverEnv.supabaseSecretKey`, `isPersistentDemonstrationConfigured`.
- Preserves: legacy variable fallback for existing installations.

- [ ] Write a failing contract test asserting new key names, server-only secret handling and persistent-mode configuration.
- [ ] Run `npx --yes bun test src/lib/supabase/key-configuration.test.ts` and confirm failure because the new configuration is absent.
- [ ] Implement the new names with legacy fallback and no client reference to `SUPABASE_SECRET_KEY`.
- [ ] Run the focused test and confirm it passes.
- [ ] Commit with `feat: support current Supabase API keys`.

### Task 2: Multi-schema database and deterministic records

**Files:**
- Create with Supabase CLI: migration named `persistent_multi_agency_demonstration` under `supabase/migrations/`
- Test: `src/lib/integrations/persistent/schema.contract.test.ts`

**Interfaces:**
- Produces RPCs: `owc_demo_lookup`, `owc_demo_process_payment`, `owc_demo_list_events`, `owc_demo_list_service_state`, `owc_demo_send_notification`.
- Produces private schemas and deterministic five-scenario data specified by the design.

- [ ] Use `npx supabase migration new persistent_multi_agency_demonstration` to create the migration file.
- [ ] Write failing SQL contract tests for schemas, tables, constraints, indexes, RLS/grants, storage buckets, five scenarios and all RPC names.
- [ ] Run the focused test and confirm the migration lacks the required objects.
- [ ] Implement idempotent schemas, tables, constraints, indexes, seed records, storage buckets and policies.
- [ ] Implement `SECURITY INVOKER` RPCs with fixed search paths; revoke default execution and grant only `service_role`.
- [ ] Run the schema contract test and confirm it passes.
- [ ] Commit with `feat: add persistent multi-agency database`.

### Task 3: Persistent repository adapter

**Files:**
- Create: `src/lib/integrations/persistent/types.ts`
- Create: `src/lib/integrations/persistent/repository.ts`
- Test: `src/lib/integrations/persistent/repository.test.ts`

**Interfaces:**
- Consumes: the five RPCs from Task 2 and `createAdminSupabaseClient()`.
- Produces: `createPersistentIntegrationRepository(client)` with `lookup`, `processPayment`, `listEvents`, `listServiceState` and `sendNotification`.

- [ ] Write failing behavior tests using a small injected RPC-client interface.
- [ ] Cover normalized identifiers, not-found responses, duplicate payments, unavailable services and sanitized database errors.
- [ ] Run the focused test and confirm failure because the repository does not exist.
- [ ] Implement the minimal repository and response validation.
- [ ] Run the focused test and confirm it passes.
- [ ] Commit with `feat: add persistent integration repository`.

### Task 4: Existing API route compatibility

**Files:**
- Create: `src/lib/integrations/persistent/gateway.ts`
- Modify: `src/lib/integrations/sandbox/http.ts`
- Modify: existing routes below `src/app/api/integrations/**/route.ts`
- Test: `src/lib/integrations/persistent/api-compatibility.test.ts`

**Interfaces:**
- Consumes: Task 3 repository and current Zod request schemas.
- Produces: async gateway operations with the current response envelope and route paths.

- [ ] Write failing contract tests proving current routes select persistent repositories when configured and preserve validation/rate limiting.
- [ ] Add a test proving configured database failure cannot fall back to in-memory success.
- [ ] Run the focused test and confirm failure.
- [ ] Extend the shared POST handler to await synchronous or asynchronous operations.
- [ ] Route NID, IPA, IRC, employment, medical, insurance, bank account, payment and notification operations through the gateway.
- [ ] Preserve the existing in-memory path only when persistent mode is explicitly disabled.
- [ ] Run focused and existing integration tests.
- [ ] Commit with `feat: persist integration route data`.

### Task 5: Persistent events, service state and end-to-end scenario

**Files:**
- Create: `src/lib/integrations/persistent/scenario.ts`
- Modify: `src/app/api/integrations/events/route.ts`
- Modify: `src/app/api/integrations/health/route.ts`
- Modify: `src/app/api/integrations/claim/process/route.ts`
- Test: `src/lib/integrations/persistent/scenario.test.ts`

**Interfaces:**
- Consumes: gateway lookup/payment/notification functions.
- Produces: `runPersistentWorkerClaimDemo(overrides)` with the existing scenario result shape.

- [ ] Write failing tests for ordered success, early stop, mismatched records, persisted telemetry and payment idempotency.
- [ ] Run the focused test and confirm failure.
- [ ] Implement async orchestration without modifying presentation components.
- [ ] Switch events and health routes to persistent records when configured.
- [ ] Run focused and existing scenario/monitor tests.
- [ ] Commit with `feat: persist demonstration workflow telemetry`.

### Task 6: Provisioning and verification scripts

**Files:**
- Create: `scripts/supabase/verify-persistent-demonstration.ts`
- Create: `docs/operations/persistent-demonstration-database.md`
- Modify: `package.json`
- Test: `src/lib/integrations/persistent/provisioning.contract.test.ts`

**Interfaces:**
- Produces command: `bun run db:verify-demonstration`.
- Verifies five scenarios, service state, lookup RPCs, storage buckets and simulated-payment constraints without printing secrets.

- [ ] Write a failing contract test for the command, documentation and credential-safe output.
- [ ] Run the focused test and confirm failure.
- [ ] Implement the read-only verification script and operator instructions.
- [ ] Run the focused test and confirm it passes.
- [ ] Commit with `ops: add persistent database verification`.

### Task 7: Full verification and delivery

**Files:**
- Review all branch changes.

**Interfaces:**
- Produces a reviewed feature branch and manual database-application checkpoint.

- [ ] Run `npx --yes bun test` and require zero failures.
- [ ] Run `npx --yes bunx tsc --noEmit` and require exit code 0.
- [ ] Run `npx --yes bun run build` without credentials and confirm the safe configuration path builds.
- [ ] Run `git diff --check` and credential-pattern scans.
- [ ] Inspect the migration for RLS, grants, indexes, idempotency and destructive statements.
- [ ] Push the feature branch and open a pull request.
- [ ] Pause for the authorized operator to apply the reviewed SQL migration to Supabase.
- [ ] After approval, run the live read-only verification command and report exact evidence.

## Self-review result

- Every design requirement maps to a task above.
- Repository interfaces are defined before route adoption.
- Existing UX files are intentionally absent from the change list.
- The five review-focus failures are assigned to Tasks 3–5.
- No task requires real external-agency credentials or real payment connectivity.
