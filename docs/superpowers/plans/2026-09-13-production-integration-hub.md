# OWC Production Integration Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-safe, server-only Integration Hub foundation for external OWC agency connectors without fabricating unknown agency schemas or live connectivity.

**Architecture:** Add a small production integration layer alongside the existing presentation/reference integration code. A registry owns service configuration/readiness while a generic HTTP transport enforces HTTPS, timeouts, correlation IDs, safe error normalization and server-only authentication.

**Tech Stack:** TypeScript, Bun test, Next.js server runtime.

**Spec:** `docs/superpowers/specs/2026-09-13-production-integration-hub-design.md`

## Global Constraints
- Mobile/browser clients call OWC APIs only.
- CPPS authority is unchanged.
- No `NEXT_PUBLIC_*` external-agency credentials.
- Do not invent external-agency field schemas.
- Missing connector configuration must prevent outbound calls.
- Safe telemetry must not contain claimant payloads or credentials.
- External systems are not represented as live until verified.

---

### Task 1: Connector configuration and readiness registry

**Files:**
- Create: `src/lib/integrations/production/types.ts`
- Create: `src/lib/integrations/production/registry.ts`
- Test: `src/lib/integrations/production/registry.test.ts`
- Modify: `src/lib/env.ts`

**Interfaces:**
- Produces `ProductionServiceName`, `ProductionConnectorConfig`, `getProductionConnectorConfig(service)`, `buildProductionConnectorReadiness(config)`.

- [ ] Write a failing registry test proving all five service keys exist and missing base URLs report `configuration-required`.
- [ ] Run `bun test src/lib/integrations/production/registry.test.ts` and confirm the intended RED failure.
- [ ] Implement server-only environment mappings and the readiness registry.
- [ ] Re-run the focused test and confirm PASS.
- [ ] Commit as `feat(integrations): add production connector registry`.

### Task 2: Safe HTTP transport

**Files:**
- Create: `src/lib/integrations/production/http.ts`
- Test: `src/lib/integrations/production/http.test.ts`

**Interfaces:**
- Consumes `ProductionConnectorConfig`.
- Produces `callProductionConnector<T>(config, operation, request)` returning a normalized `ProductionIntegrationResult<T>`.

- [ ] Write failing tests proving unconfigured services do not call fetch, HTTPS is required outside localhost, bearer credentials stay in request headers only, 2xx JSON is normalized, and upstream/network failures are isolated.
- [ ] Run focused tests and verify RED.
- [ ] Implement the minimum transport with 10-second default timeout and generated correlation ID.
- [ ] Re-run focused tests and verify GREEN.
- [ ] Commit as `feat(integrations): add safe production connector transport`.

### Task 3: Safe telemetry projection

**Files:**
- Create: `src/lib/integrations/production/telemetry.ts`
- Test: `src/lib/integrations/production/telemetry.test.ts`

**Interfaces:**
- Consumes normalized production integration result metadata.
- Produces telemetry containing only service, operation, correlation ID, outcome, HTTP status, duration and timestamp.

- [ ] Write failing test with identity/medical/bank payload fields and assert none appear in serialized telemetry.
- [ ] Verify RED.
- [ ] Implement metadata-only telemetry projection.
- [ ] Verify GREEN.
- [ ] Commit as `feat(integrations): add safe production telemetry`.

### Task 4: Operational readiness and verification

**Files:**
- Create: `docs/operations/production-integration-hub.md`
- Modify: `src/lib/operations/readiness.ts`
- Modify: `src/lib/operations/readiness.test.ts`

**Interfaces:**
- Adds an external-integration readiness check summarizing the five registered connectors without claiming live verification.

- [ ] Add failing readiness test for partial connector configuration.
- [ ] Verify RED.
- [ ] Implement registry-backed readiness summary.
- [ ] Verify GREEN.
- [ ] Document endpoint/credential/schema prerequisites and smoke-test procedure.
- [ ] Run `bun test && bun run lint && bun run build` and GitHub Actions clean-room CI.
- [ ] Review diff for secrets, payload logging, browser credentials, CPPS authority changes and unsupported connectivity claims.
- [ ] Open a draft layered PR only on a green exact head.