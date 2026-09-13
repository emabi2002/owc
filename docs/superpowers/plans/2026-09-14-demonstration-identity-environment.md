# Task 1 — Demonstration Identity Environment Implementation Plan

**Goal:** deliver a production-like, explicit reference identity provider for the OWC Department demonstration while preserving live Supabase Auth for post-award integration.

## Phase 1 — Contract and RED evidence

- Add Task 1 branch to CI allow-list only; do not alter runtime behavior.
- Add identity contract tests covering explicit mode selection, seven personas, first-class assessment/finance roles, staff/non-staff separation, MFA, session signing, role permissions and demonstration labelling.
- Run CI and confirm the new identity tests fail for the expected missing implementation only while the existing suite remains green.

## Phase 2 — Identity model and authorization

- Extend `AppRole` with `assessment_officer` and `finance_officer` while retaining existing roles.
- Extend role labels and permission matrix with `claims.assess` and `payments.manage` separation of duties.
- Update canonical database enum definition and add an idempotent role-extension SQL migration for already-provisioned PostgreSQL environments.
- Create `src/lib/auth/identity-mode.ts` with explicit `live`/`demonstration` selection. No configuration-based implicit demo fallback.
- Create `src/lib/auth/demo-identity.ts` with seven synthetic principals and server-side authentication/MFA/session primitives.

## Phase 3 — Session integration

- Replace the current single implicit demo Administrator fallback in `getSessionUser()` with explicit demonstration-session resolution.
- Preserve the existing Supabase live session/profile path when identity mode is `live`.
- Require active principals and verified MFA for privileged staff sessions.
- Ensure Employer and Claimant cannot be returned as `SessionUser` for the admin console.

## Phase 4 — API and user experience

- Update `/api/admin/login` to dispatch to demonstration or live provider according to explicit mode.
- Update `/api/admin/mfa` and `/api/admin/logout` for the same provider boundary.
- Add a safe server endpoint for listing public demonstration staff persona labels/login identifiers only; never expose passwords, MFA code or secrets.
- Update `/admin/login` to display `OWC Demonstration Environment` and persona selection in demonstration mode while retaining official-credential wording in live mode.
- Preserve rate limiting and audit behavior.

## Phase 5 — Configuration and operations

- Add `OWC_IDENTITY_MODE`, `OWC_DEMO_SESSION_SECRET`, replaceable demo credential/MFA configuration to `.env.example` without real secrets.
- Document demonstration sign-in, persona roles and post-award switch to live identity.
- Update master demonstration task status for Task 1 only after verification.

## Phase 6 — Verification and merge

- Run full feature-head CI: security assurance, Bun tests, reference UAT, lint/type-check, production build, Drupal clean-room.
- Open PR to `main` and merge only after exact-head success.
- Run full `main` CI on the merge SHA and require green result (SSH deployment may cleanly skip until Task 8 configures a host).
- Only then begin Task 2 from the newly verified `main`.