# OWC Drupal Editor Identity, SSO and MFA Design

## Purpose

Provide enterprise authentication for OWC Drupal editors without changing the public claimant identity boundary. Drupal administration uses an external OpenID Connect (OIDC) identity provider as the primary sign-in path, with MFA enforced by that provider. Drupal remains responsible for CMS authorization through its existing editorial roles.

## Scope

This work covers Drupal CMS administrators, content editors, reviewers, publishers and auditors. It does not replace claimant authentication, CPPS identity, Supabase portal identity, or external-agency identity integrations.

## Architecture

1. Drupal uses the contributed `openid_connect` client module for standards-based OIDC authentication.
2. The identity provider must return a stable subject (`sub`), email and `groups` claim. MFA is an identity-provider policy; Drupal does not implement a second independent MFA challenge.
3. OIDC group values map to existing Drupal roles:
   - `owc-cms-administrators` -> `cms_administrator`
   - `owc-content-editors` -> `content_editor`
   - `owc-reviewers` -> `reviewer`
   - `owc-publishers` -> `publisher`
   - `owc-auditors` -> `auditor`
4. OIDC-managed roles are synchronized at each OIDC login. Removed group membership removes the corresponding managed Drupal role.
5. A custom `owc_identity` policy module enforces the local-login boundary, records authentication/role events, and provides verification commands. It does not implement OAuth/OIDC cryptography itself.
6. Normal local username/password login is disabled when `OWC_IDENTITY_ENFORCE_SSO=1`. The Drupal UID 1 recovery account may use local login only when `OWC_BREAK_GLASS_LOCAL_LOGIN=1` is also set. This is an emergency operational control, not a normal administrator login path.

## Secret handling

No OIDC client secret is committed to Git. Runtime settings are supplied by environment variables or the deployment secret store. Required values are:

- `OWC_OIDC_CLIENT_ID`
- `OWC_OIDC_CLIENT_SECRET`
- `OWC_OIDC_AUTHORIZATION_ENDPOINT`
- `OWC_OIDC_TOKEN_ENDPOINT`
- `OWC_OIDC_USERINFO_ENDPOINT`
- optional `OWC_OIDC_END_SESSION_ENDPOINT`
- `OWC_IDENTITY_ENFORCE_SSO`
- `OWC_BREAK_GLASS_LOCAL_LOGIN`

The redirect URI is the Drupal OpenID Connect generic-client callback generated from the externally visible CMS base URL. TLS termination and trusted reverse-proxy configuration remain deployment responsibilities.

## Authorization policy

The IdP authenticates people; Drupal authorizes CMS actions. The existing least-privilege roles remain authoritative for Drupal permissions. The external IdP controls only membership in the five managed Drupal roles above. UID 1 is never group-mapped and is reserved for recovery.

Unknown external groups grant no additional Drupal role. OIDC accounts must not receive the built-in Drupal Administrator role. The CMS Administrator role remains non-superuser and retains only the permissions already committed in the enterprise CMS configuration.

## Local-login policy

When SSO enforcement is off, local login remains available for DEV/UAT bootstrap.

When SSO enforcement is on:

- normal local accounts are denied at the Drupal login form;
- OIDC sign-in remains available;
- UID 1 is denied unless break-glass login is explicitly enabled in the runtime environment;
- disabling break-glass immediately restores the SSO-only posture without changing account data.

No break-glass password is stored in repository configuration.

## Audit

`owc_identity` writes structured events to the Drupal logging subsystem for:

- successful OIDC authorization, including provider identifier and resulting managed roles;
- local-login denial under the SSO policy;
- break-glass local login use;
- changes to managed Drupal role membership.

Production deployment must forward Drupal logs to the approved centralized logging/SIEM platform. Repository work verifies event generation hooks but does not claim a production SIEM connection.

## Failure behavior

- If the IdP is unavailable, normal CMS editors cannot bypass SSO using local passwords.
- Break-glass access requires an explicit runtime switch plus the UID 1 credential.
- Missing or unrecognized OIDC groups result in no managed editorial role.
- Missing OIDC client configuration causes identity readiness verification to fail before production cutover.
- Public Drupal JSON:API content remains unaffected by editor SSO availability.

## Deployment sequence

1. Build Drupal with the OIDC dependency and `owc_identity` module.
2. Reconstruct Drupal from committed configuration.
3. Run identity readiness verification in non-enforcing mode without secrets.
4. Supply IdP endpoints/client credentials in DEV/UAT secret storage.
5. Validate successful OIDC login, MFA at the IdP, group-to-role synchronization, role revocation and logout.
6. Set `OWC_IDENTITY_ENFORCE_SSO=1` only after OIDC validation.
7. Test break-glass procedure, then return `OWC_BREAK_GLASS_LOCAL_LOGIN=0`.

## Verification criteria

Repository/CI acceptance requires:

- Drupal 11 clean-room reconstruction remains green;
- `openid_connect` and `owc_identity` are installed and enabled;
- all five group-to-role mappings are present;
- no OIDC secret appears in committed configuration;
- SSO/local-login policy tests pass;
- identity readiness script passes in CI-safe non-enforcing mode;
- application tests, lint/type-check and build remain green.

Live DEV/UAT acceptance additionally requires a real IdP account with MFA and cannot be completed without OWC-provided IdP registration/credentials.