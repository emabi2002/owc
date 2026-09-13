# OWC Demonstration Identity Environment

## Purpose

This identity provider exists for the Department of Labour & Employment demonstration. It gives the OWC presentation system realistic authentication, MFA and role separation without pretending that the Department's authoritative identity service is already connected.

The same application authorization contract is retained for post-award migration: change identity mode to `live`, configure the approved Supabase/IdP credentials and map authoritative groups/claims to the OWC application roles.

## Identity modes

- `OWC_IDENTITY_MODE=live` — approved live identity path. Missing live configuration fails closed; there is no automatic Administrator fallback.
- `OWC_IDENTITY_MODE=demonstration` — synthetic OWC presentation identities with signed server sessions and MFA.

Never enable demonstration identity on an authoritative production environment after award.

## Required demonstration configuration

Set these as host/server secrets, not source-controlled values:

- `OWC_IDENTITY_MODE=demonstration`
- `OWC_DEMO_SESSION_SECRET` — random value of at least 32 characters
- `OWC_DEMO_PASSWORD` — presentation credential shared only with the demonstration team
- `OWC_DEMO_MFA_CODE` — six-digit presentation verification code

The public demonstration-persona API exposes only display name, login email and role. It never returns the password, MFA code or session signing secret.

## Demonstration personas

| Login | Persona | Access boundary |
| --- | --- | --- |
| `admin.demo@owc.gov.pg` | OWC Administrator | Full staff administration |
| `claims.demo@owc.gov.pg` | Claims Officer | Claim review/management and evidence review |
| `assessment.demo@owc.gov.pg` | Assessment Officer | Claim viewing and assessment |
| `finance.demo@owc.gov.pg` | Finance / Payment Officer | Claim viewing and payment processing |
| `editor.demo@owc.gov.pg` | Content Editor | Content creation/edit/submission |
| `employer.demo@pacificengineering.example` | Employer Representative | Employer scopes only; no staff console |
| `claimant.demo@example.test` | Claimant / Worker | Claimant scopes only; no staff console |

The five staff personas require the MFA step before a full admin-console session is issued. Employer and Claimant are included in the reference identity catalogue for later portal workflows and cannot authenticate into `/admin`.

## Security behavior

- Staff login remains rate limited.
- Demonstration session and MFA cookies are HttpOnly and SameSite=Lax.
- Session tokens are HMAC signed and expire automatically.
- Privileged staff cannot bypass MFA.
- Employer and Claimant have no `AppRole` and therefore cannot satisfy staff permission checks.
- Authentication/audit events exclude passwords, MFA codes and signing secrets.
- Assessment and Finance are first-class roles, giving clear separation between claim assessment and payment authorization.

## Presentation procedure

1. Confirm the host displays **OWC Demonstration Environment** on the staff sign-in page.
2. Select the required staff persona and enter the configured demonstration password.
3. Complete the demonstration MFA challenge using the configured six-digit code.
4. Show that the persona sees only its permitted functions.
5. Sign out before switching to a different persona.

For role-separation demonstrations, use Claims Officer → Assessment Officer → Finance/Payment Officer in sequence rather than using Administrator for the whole story.

## Post-award migration

When authoritative identity details are supplied:

1. Configure the approved live Supabase/IdP/OIDC environment.
2. Map authoritative groups/claims to `administrator`, `editor`, `reviewer`, `claims_officer`, `assessment_officer`, `finance_officer` and `viewer` as required.
3. Set `OWC_IDENTITY_MODE=live`.
4. Remove demonstration credentials from the deployed secret store.
5. Execute live authentication, MFA, RBAC and audit acceptance testing.

No application workflow redesign should be required because both providers terminate at the same OWC session and permission contracts.