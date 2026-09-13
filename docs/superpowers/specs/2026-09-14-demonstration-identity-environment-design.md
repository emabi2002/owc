# OWC Demonstration Identity Environment — Design

Date: 2026-09-14
Status: Approved programme work package — Task 1 of 15

## Objective

Provide a credible production-like identity and access experience for the OWC Department demonstration while preserving the existing live Supabase/Auth identity path for post-award migration.

The demonstration environment must never silently elevate an unauthenticated visitor to Administrator. Demonstration identity is explicit, session-based, auditable, role-scoped, and clearly labelled as the OWC Demonstration Environment.

## Identity modes

The application supports two identity modes through one internal principal contract:

1. **live** — existing Supabase Auth/profile/MFA path. This remains the future production integration path.
2. **demonstration** — explicit OWC reference identity provider enabled only when `OWC_IDENTITY_MODE=demonstration`.

No implicit fallback from live identity to demonstration identity is permitted. If live identity is selected but unavailable, authentication fails closed.

## Demonstration personas

Seven stable synthetic identities are provided:

| Persona | Principal type | Application role / scope | MFA |
| --- | --- | --- | --- |
| OWC Administrator | staff | administrator | required |
| Claims Officer | staff | claims_officer | required |
| Assessment Officer | staff | assessment_officer | required |
| Finance / Payment Officer | staff | finance_officer | required |
| Content Editor | staff | editor | required |
| Employer Representative | employer | employer portal scopes only | optional/not staff |
| Claimant / Worker | claimant | claimant portal scopes only | optional/not staff |

Assessment Officer and Finance Officer are first-class staff roles, not aliases for Reviewer or Viewer. Existing legacy Reviewer/Viewer roles remain supported so the change is backwards-compatible.

## Authentication contract

`DemoPrincipal` is the demonstration provider's canonical identity object. It contains a stable synthetic ID, email/login, display name, principal type, optional staff role, active status, MFA requirement and allowed scopes.

The provider authenticates against a deterministic demonstration credential set intended only for the presentation environment. Password verification is server-side and credentials are not exposed by public APIs. The credential defaults must be replaceable by environment configuration before external presentation.

Successful primary authentication for a privileged staff persona creates a short-lived pending MFA challenge rather than a full authenticated session. The demonstration MFA verifier accepts the configured six-digit demonstration code and then issues the authenticated session.

Authenticated demonstration sessions are stored in an HttpOnly, SameSite=Lax cookie and signed with `OWC_DEMO_SESSION_SECRET`. The cookie carries only the minimum signed principal/session claims; it is not treated as a source of mutable authorization data without signature verification.

## Authorization

Existing server-side `hasPermission`/`requirePermission` controls remain authoritative for staff console functions. The role matrix is extended with:

- `claims.assess` for Assessment Officer and Administrator.
- `payments.manage` for Finance/Payment Officer and Administrator.

Claims Officer keeps claim-management rights but does not gain payment authority. Assessment Officer can view claims and assess but cannot manage users/settings/content. Finance Officer can view claims and manage payment operations but cannot alter claim assessment or users.

Employer and Claimant are not `AppRole` staff users and must never pass staff-console permission checks.

## Audit

The demonstration provider records structured auth events through the existing audit abstraction where available and through the demo identity event store for deterministic presentation evidence:

- login succeeded / failed
- MFA challenged / succeeded / failed
- logout
- authorization denied

Events must not record passwords, MFA codes or session secrets.

## User experience

The existing `/admin/login` page remains the staff entry point. In demonstration mode it displays `OWC Demonstration Environment`, offers the five staff demonstration personas and authenticates through the same `/api/admin/login` and `/api/admin/mfa` contracts. In live mode the page retains the normal official-credential experience.

Employer and Claimant principals are exposed through the shared identity catalogue/API for later portal screens in the programme; they are not permitted into `/admin`.

## Migration after award

All application code consumes the internal principal/session/permission contract rather than depending on the demo provider directly. Post-award migration therefore consists of selecting `live` identity mode and mapping authoritative IdP/Supabase claims to the same internal staff roles/scopes. Demonstration accounts and credentials are then disabled without redesigning the application.

## Acceptance criteria

Task 1 is complete when:

- all seven personas are represented;
- staff roles include first-class Assessment and Finance roles;
- demo authentication is explicit and never an implicit fallback;
- privileged demo staff complete MFA before receiving a full session;
- signed HttpOnly session cookies are used;
- staff permissions enforce separation of duties;
- Employer/Claimant cannot enter staff authorization;
- authentication events are auditable without sensitive values;
- the login experience identifies the demonstration environment;
- live Supabase authentication remains available and fail-closed;
- tests, lint/type-check, production build, reference UAT and Drupal clean-room all pass.