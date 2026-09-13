# API & Integration Guide

How the OWC portal integrates with **Supabase** (Auth + PostgreSQL), **Drupal**, the **CPPS** claims back-end, and external/reference service APIs.

## Architecture

```text
Browser / Mobile
      │
      ▼
Next.js OWC application
      │
      ├─ Public/content data boundary ──▶ Drupal / Supabase / reference content
      │
      ├─ CPPS adapter  src/lib/cpps/api.ts
      │       ├─▶ live CPPS REST / GraphQL       source: cpps
      │       ├─▶ reference CPPS (explicit UAT)  source: reference
      │       └─▶ unavailable (fail closed)
      │
      ├─ Production Integration Hub ──▶ approved agency/provider APIs
      │
      └─ Controlled sandbox/reference APIs ──▶ synthetic UAT/demo services
```

The important distinction is between **content/reference fallbacks used for presentation** and **transactional CPPS/integration behavior**. CPPS no longer silently fabricates successful mock results. Live CPPS wins when configured; reference CPPS must be explicitly enabled; otherwise CPPS-dependent operations fail closed.

## Supabase

- Clients: `src/lib/supabase/client.ts` (browser), `server.ts` (cookie-bound server), `admin.ts` (service-role), `middleware.ts` (session refresh).
- Types: `src/lib/supabase/types.ts`.
- Schema + RLS: `src/lib/db/schema.sql`.
- Tables include public/editorial, enquiries, profiles, audit and claim-tracking data.
- RLS keeps anonymous access limited to permitted public operations while privileged operations remain server-side.

The authoritative OWC production Supabase/storage environment must still be separately supplied and accepted before production cutover.

## Drupal

Drupal is the enterprise editorial CMS. In authoritative Drupal mode, public content reads fail closed rather than silently falling back if Drupal is unavailable. Transitional/fallback modes remain explicit environment choices.

## CPPS — Compensation Processing & Payment System

Stable OWC server adapter: `src/lib/cpps/api.ts`.

### Live CPPS configuration

```env
CPPS_API_BASE_URL="https://approved-cpps.example/api"
CPPS_API_KEY="..."
CPPS_GRAPHQL_ENDPOINT=""
```

A configured live CPPS always takes precedence over reference mode.

### Reference CPPS configuration

For controlled development/UAT/demo only:

```env
OWC_ENABLE_REFERENCE_ECOSYSTEM="true"
```

Keep this `false` in production unless OWC has deliberately approved a reference-only non-production environment.

### Backend-selection rule

| Live CPPS configured | Reference enabled | Result |
| --- | --- | --- |
| Yes | Either | Use live CPPS (`source: "cpps"`) |
| No | Yes | Use synthetic reference CPPS (`source: "reference"`) |
| No | No | Fail closed (`source: "unavailable"` on the error) |

### Existing OWC CPPS operations

| Function | Live transport | OWC use |
| --- | --- | --- |
| `getClaimStatus(ref, surname?)` | `GET /claims/:ref/status` | Claim tracking |
| `checkEmployerRegistration(q)` | `GET /employers/verify?q=` | Employer verification |
| `submitClaimLodgement(input)` | `POST /claims` | Claim lodgement |
| `reportWorkplaceInjury(input)` | `POST /injuries` | Employer injury report |
| `submitEnquiry(input)` | `POST /enquiries` | Enquiry submission |

Live REST calls use server-only authentication headers and a 10-second timeout. A GraphQL helper remains available when the authoritative CPPS supports GraphQL.

### Reference CPPS

The repository includes a stateful process-local reference CPPS for synthetic UAT. It models claim registration, lifecycle transitions, assessment, decision, payment scheduling, synthetic/idempotent payment, employer verification, injury receipts and enquiry receipts.

The reference assessment formula is an explicit assumption only and is not a statutory or production compensation rule. Reference payment never moves real money. See `docs/operations/reference-cpps.md`.

Controlled reference endpoints, available only when reference mode is enabled:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/reference/cpps/health` | GET | Safe reference-service health |
| `/api/reference/cpps/claims` | POST | Register a validated synthetic claim |
| `/api/reference/cpps/claims/{reference}` | GET | Retrieve reference claim status |

Reference responses explicitly identify themselves as synthetic and not production connected.

## Public OWC HTTP API

Public POST endpoints are rate-limited, validate input with Zod and keep integration credentials server-side.

| Endpoint | Typical limit | Purpose |
| --- | ---: | --- |
| `/api/enquiries` | 5/min | Submit public enquiry |
| `/api/claims/track` | 20/min | Track a claim |
| `/api/claims/lodge` | 5/min | Lodge a worker claim |
| `/api/employers/verify` | 15/min | Verify employer registration |
| `/api/injuries` | 5/min | Submit employer injury report |
| `/api/admin/login` | 5/min | Staff sign-in |
| `/api/admin/mfa` | 6/min | TOTP challenge/verification |
| `/api/admin/logout` | — | Staff sign-out |

## External Integration Hub

The production-safe integration boundary supports the approved service classes for identity/NID, employer registry, insurance, payments and medical providers. Endpoint configuration alone is not evidence of live integration: each service still requires an authoritative API contract, credentials/networking, UAT and agency/provider acceptance.

A separate synthetic integration sandbox remains available for controlled demonstrations and end-to-end reference scenarios.

## Moving from reference to live CPPS

1. Obtain authoritative CPPS DEV/UAT/PROD endpoints, API/schema documentation and ownership contacts.
2. Confirm authentication, networking, data classification and credential rotation.
3. Map the real CPPS contract against the reference contract and remove any assumptions that differ.
4. Execute contract tests and end-to-end UAT against approved CPPS test data.
5. Verify error, retry, timeout, idempotency and reconciliation behavior.
6. Complete business/security acceptance.
7. Configure the live CPPS endpoint; the adapter will then select live CPPS ahead of reference mode.

No claimant-facing OWC workflow should require redesign merely because the backing CPPS implementation changes, unless authoritative CPPS discovery identifies a materially different business requirement.
