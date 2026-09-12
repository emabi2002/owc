# OWC Integration Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a realistic, synthetic external-agency integration ecosystem and live monitoring experience for the OWC RFQ demonstration without misrepresenting production connections.

**Architecture:** Extend the existing Next.js application with typed sandbox-domain services, API routes and an integration-monitor UI. Every service returns source metadata and correlation identifiers. Synthetic fixtures are kept separate from production integration clients so future real APIs can replace sandbox adapters without changing portal workflows.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Bun test runner, Zod, existing OWC security/rate-limit utilities.

**Spec:** `docs/superpowers/specs/2026-09-12-owc-integration-sandbox-design.md`

## Global Constraints
- All external-agency demo records are synthetic.
- Every sandbox response must explicitly identify `source: "sandbox"`.
- Do not imply production access to IRC, NID, IPA, BPNG, insurers, hospitals or employers.
- Existing CPPS integration remains independent and authoritative for claims where configured.
- No secrets in source control.
- Use existing Next.js route-handler, Zod validation and rate-limit patterns.
- New behavior is test-first with `bun test`.

---

### Task 1: Test Harness and Shared Sandbox Contracts

**Files:**
- Modify: `package.json`
- Create: `src/lib/integrations/sandbox/types.ts`
- Create: `src/lib/integrations/sandbox/service.test.ts`
- Create: `src/lib/integrations/sandbox/service.ts`

**Interfaces:**
- Produces `SandboxServiceName`, `SandboxEnvelope<T>`, `SandboxServiceStatus`, `makeSandboxEnvelope()`, `makeCorrelationId()`.
- Later tasks consume these types in all agency adapters and API responses.

- [ ] Step 1: Add `"test": "bun test"` to package scripts.
- [ ] Step 2: Write failing tests asserting sandbox envelopes contain `source: "sandbox"`, correlation ID, ISO timestamp and service name.
- [ ] Step 3: Run `bun test src/lib/integrations/sandbox/service.test.ts` and confirm RED because implementation is absent.
- [ ] Step 4: Implement the minimal shared types/helpers.
- [ ] Step 5: Run the test and confirm GREEN.
- [ ] Step 6: Run `bun run lint` and commit.

### Task 2: Synthetic Dataset and Agency Domain Services

**Files:**
- Create: `src/lib/integrations/sandbox/data.ts`
- Create: `src/lib/integrations/sandbox/agencies.test.ts`
- Create: `src/lib/integrations/sandbox/agencies.ts`

**Interfaces:**
- Produces `verifyIdentity(nid)`, `verifyEmployer(registrationNo)`, `checkTaxCompliance(tin)`, `verifyEmployment(employeeNo)`, `verifyMedicalCertificate(certificateNo)`, `verifyInsurancePolicy(policyNo)`, `verifyBankAccount(accountNo)`, `processSandboxPayment(input)`, `sendSandboxNotification(input)`.
- All functions return `SandboxEnvelope<T>` or explicit not-found/unavailable results.

- [ ] Step 1: Write failing happy-path tests using one coherent synthetic claimant/employer scenario.
- [ ] Step 2: Add not-found tests for each identifier-based service.
- [ ] Step 3: Add payment idempotency test: repeated idempotency key returns same transaction reference.
- [ ] Step 4: Run targeted tests and confirm RED.
- [ ] Step 5: Add synthetic fixtures for claimant, employer, tax, employment, medical, insurance and bank data.
- [ ] Step 6: Implement minimal lookup/service functions.
- [ ] Step 7: Run tests and confirm GREEN.
- [ ] Step 8: Run lint and commit.

### Task 3: Sandbox REST API Routes

**Files:**
- Create: `src/app/api/sandbox/health/route.ts`
- Create: `src/app/api/sandbox/nid/verify/route.ts`
- Create: `src/app/api/sandbox/ipa/company/route.ts`
- Create: `src/app/api/sandbox/irc/compliance/route.ts`
- Create: `src/app/api/sandbox/employer/employee/route.ts`
- Create: `src/app/api/sandbox/medical/certificate/route.ts`
- Create: `src/app/api/sandbox/insurance/policy/route.ts`
- Create: `src/app/api/sandbox/bank/account/route.ts`
- Create: `src/app/api/sandbox/bank/payment/route.ts`
- Create: `src/app/api/sandbox/notifications/send/route.ts`
- Create: `src/lib/integrations/sandbox/validation.ts`

**Interfaces:**
- REST JSON endpoints consume validated POST bodies and return sandbox envelopes.
- Health returns all sandbox service states and presentation labels.

- [ ] Step 1: Write validation tests for each request schema.
- [ ] Step 2: Verify validation tests fail before schemas exist.
- [ ] Step 3: Implement Zod schemas and make tests pass.
- [ ] Step 4: Add route handlers following existing rate-limit/error patterns.
- [ ] Step 5: Build and type-check the application.
- [ ] Step 6: Commit.

### Task 4: Integration Event Store and Trace Model

**Files:**
- Create: `src/lib/integrations/sandbox/events.test.ts`
- Create: `src/lib/integrations/sandbox/events.ts`
- Modify: sandbox service functions from Task 2.

**Interfaces:**
- Produces `recordIntegrationEvent()`, `listIntegrationEvents()`, `clearIntegrationEvents()` for demo telemetry.
- Event fields: correlation ID, service, operation, status, duration, timestamp, source; no unrestricted sensitive payloads.

- [ ] Step 1: Write failing tests for event recording and bounded retention.
- [ ] Step 2: Verify RED.
- [ ] Step 3: Implement in-memory presentation event store with safe metadata only.
- [ ] Step 4: Instrument sandbox calls.
- [ ] Step 5: Verify GREEN and commit.

### Task 5: Integration Monitor UI

**Files:**
- Create: `src/app/admin/integrations/page.tsx`
- Create: `src/components/integrations/integration-monitor.tsx`
- Create: `src/app/api/sandbox/events/route.ts`

**Interfaces:**
- Shows service name, SANDBOX badge, health, last operation, latency, correlation ID and timestamp.
- Polls health/events API; does not expose sensitive payloads.

- [ ] Step 1: Write component-level pure-formatting tests for status derivation and labels.
- [ ] Step 2: Verify RED.
- [ ] Step 3: Implement monitor data-model helpers.
- [ ] Step 4: Implement server page/client monitor component.
- [ ] Step 5: Build and lint.
- [ ] Step 6: Commit.

### Task 6: End-to-End Demo Orchestrator

**Files:**
- Create: `src/lib/integrations/sandbox/demo-scenario.test.ts`
- Create: `src/lib/integrations/sandbox/demo-scenario.ts`
- Create: `src/app/api/sandbox/demo/run/route.ts`
- Create: `src/app/admin/integrations/demo/page.tsx`

**Interfaces:**
- Produces `runWorkerClaimDemo()` returning ordered steps for NID -> IPA -> IRC -> employment -> medical -> insurance -> bank verification -> payment -> notification.
- Stops on critical identity/employer failures; non-critical notification failures are reported without rolling back payment simulation.

- [ ] Step 1: Write failing successful-scenario test asserting step order and all verification outcomes.
- [ ] Step 2: Write failing test for identity-not-found short-circuit.
- [ ] Step 3: Write failing test for idempotent repeat payment.
- [ ] Step 4: Implement orchestrator minimally.
- [ ] Step 5: Add route and presentation page.
- [ ] Step 6: Run tests/build/lint and commit.

### Task 7: Documentation and Presentation Script

**Files:**
- Create: `docs/INTEGRATION_SANDBOX.md`
- Create: `docs/RFQ_LIVE_DEMO_SCRIPT.md`
- Modify: `README.md`

**Interfaces:**
- Documents endpoint contracts, synthetic credentials/identifiers, truthfulness labels, demo reset procedure and scripted presentation flow.

- [ ] Step 1: Document each sandbox endpoint and example identifiers.
- [ ] Step 2: Document the end-to-end presentation script and expected visible results.
- [ ] Step 3: Add clear SANDBOX vs FUTURE PRODUCTION CONNECTION language.
- [ ] Step 4: Update README architecture/documentation section.
- [ ] Step 5: Run lint/build and commit.

### Task 8: CI Verification and Draft PR Review

**Files:**
- Modify: `.github/workflows/deploy.yml` only if required so pull-request CI executes `bun test` before build.

**Interfaces:**
- PR CI must run tests, lint/type-check and build without deploying.

- [ ] Step 1: Add test execution to CI if absent.
- [ ] Step 2: Open/update draft PR to `main`.
- [ ] Step 3: Wait for GitHub Actions and inspect job results.
- [ ] Step 4: Fix any CI failures on the feature branch.
- [ ] Step 5: Review diff against the spec and ensure no real agency data/credentials are present.
- [ ] Step 6: Mark PR ready only after all verification is green.
