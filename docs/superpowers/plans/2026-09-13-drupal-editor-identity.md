# OWC Drupal Editor Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OIDC-based Drupal editor SSO with IdP-enforced MFA, deterministic group-to-role synchronization, local-login break-glass controls and auditable identity events.

**Architecture:** Drupal delegates authentication to the contributed `openid_connect` module and retains authorization through the existing OWC CMS roles. A small custom `owc_identity` module owns OWC-specific login policy, audit logging and deployment verification; no OAuth/OIDC cryptography is reimplemented. Runtime client secrets/endpoints come from environment/secret storage and are never committed.

**Tech Stack:** Drupal 11, OpenID Connect 3.x, PHP 8.5, Drush 13, Docker Compose, PostgreSQL 16, Bun CI tests.

**Spec:** `docs/superpowers/specs/2026-09-13-drupal-editor-identity-design.md`

## Global Constraints

- OIDC is the primary CMS editor authentication path.
- MFA is enforced by the external identity provider.
- Existing Drupal roles remain the authorization boundary.
- Managed groups map only to `cms_administrator`, `content_editor`, `reviewer`, `publisher`, `auditor`.
- UID 1 is recovery-only and never group-mapped.
- No OIDC client secret may be committed.
- Restricted claimant evidence and claimant identity remain outside this work package.
- CI must remain able to reconstruct Drupal without real IdP credentials.

---

### Task 1: Dependency and identity-module foundation

**Files:**
- Modify: `drupal/Dockerfile`
- Create: `drupal/modules/custom/owc_identity/owc_identity.info.yml`
- Create: `drupal/modules/custom/owc_identity/owc_identity.services.yml`
- Create: `src/lib/drupal/identity/identity-config.test.ts`

**Interfaces:**
- Produces Drupal modules `openid_connect`, `externalauth`, and `owc_identity` in the container image.
- Produces the service `owc_identity.policy` for later login-policy checks.

- [ ] Write a failing Bun test that expects the Dockerfile to install `drupal/openid_connect:^3.0@alpha`, copy `drupal/modules/custom` into `/opt/drupal/web/modules/custom`, and define the `owc_identity` module.
- [ ] Run `bun test src/lib/drupal/identity/identity-config.test.ts` and confirm RED.
- [ ] Modify the Dockerfile and create module metadata/services.
- [ ] Re-run the focused test and confirm GREEN.

### Task 2: Runtime policy service and local-login enforcement

**Files:**
- Create: `drupal/modules/custom/owc_identity/src/IdentityPolicy.php`
- Create: `drupal/modules/custom/owc_identity/owc_identity.module`
- Extend: `src/lib/drupal/identity/identity-config.test.ts`

**Interfaces:**
- `IdentityPolicy::ssoEnforced(): bool`
- `IdentityPolicy::breakGlassEnabled(): bool`
- `IdentityPolicy::localLoginAllowed(?UserInterface $account): bool`
- Drupal form alter attaches `owc_identity_validate_local_login` to `user_login_form`.

- [ ] Write failing tests asserting the policy reads `OWC_IDENTITY_ENFORCE_SSO` and `OWC_BREAK_GLASS_LOCAL_LOGIN`, that local validation exists, and that only UID 1 may pass when both enforcement and break-glass are enabled.
- [ ] Run focused tests and confirm RED.
- [ ] Implement `IdentityPolicy` with strict truth parsing (`1`, `true`, `yes`, `on`) and local-login policy.
- [ ] Implement login form validation that loads the submitted account, denies normal local login under SSO enforcement, and logs denial/break-glass use without logging passwords.
- [ ] Re-run focused tests and confirm GREEN.

### Task 3: OIDC role synchronization and audit hooks

**Files:**
- Modify: `drupal/modules/custom/owc_identity/owc_identity.module`
- Create: `drupal/modules/custom/owc_identity/src/ManagedRoles.php`
- Extend: `src/lib/drupal/identity/identity-config.test.ts`

**Interfaces:**
- `ManagedRoles::ids(): array` returns exactly the five managed role IDs.
- `hook_openid_connect_post_authorize(UserInterface $account, array $context)` logs successful OIDC authorization and resulting managed roles.
- `hook_entity_update(EntityInterface $entity)` logs managed-role deltas for user entities.

- [ ] Write failing tests for the exact managed-role set and presence of the post-authorize/entity-update audit hooks.
- [ ] Run focused tests and confirm RED.
- [ ] Implement the managed-role helper and structured logging hooks.
- [ ] Re-run focused tests and confirm GREEN.

### Task 4: Committed Drupal OIDC settings and role mappings

**Files:**
- Modify: `drupal/config/sync/core.extension.yml`
- Create/Modify: `drupal/config/sync/openid_connect.settings.yml`
- Create: `drupal/config/sync/openid_connect.client.generic.yml` only if the installed 3.x configuration entity schema supports a secret-free disabled generic client; otherwise configure the client at runtime through the provisioning script in Task 5.
- Extend: `src/lib/drupal/identity/identity-config.test.ts`

**Interfaces:**
- Role mappings:
  - `owc-cms-administrators` -> `cms_administrator`
  - `owc-content-editors` -> `content_editor`
  - `owc-reviewers` -> `reviewer`
  - `owc-publishers` -> `publisher`
  - `owc-auditors` -> `auditor`
- `force_reset_role_mappings: true` when supported by the installed module schema.

- [ ] Write failing tests asserting `core.extension.yml` enables `externalauth`, `openid_connect`, and `owc_identity`, and committed settings contain all five mappings but no `client_secret` value.
- [ ] Run focused tests and confirm RED.
- [ ] Add modules/settings using the exact schema accepted by the installed OpenID Connect 3.x release.
- [ ] Run clean-room Drupal install. If schema validation fails, inspect the installed module defaults/schema and make the smallest correction.
- [ ] Re-run focused and clean-room tests until GREEN.

### Task 5: Runtime OIDC client provisioning and readiness verification

**Files:**
- Create: `drupal/scripts/configure-identity.php`
- Create: `drupal/scripts/configure-identity.sh`
- Create: `drupal/scripts/verify-identity.php`
- Create: `drupal/scripts/verify-identity.sh`
- Modify: `drupal/.env.example`
- Modify: `drupal/README.md`
- Extend: `src/lib/drupal/identity/identity-config.test.ts`

**Interfaces:**
- `configure-identity.sh` consumes the OIDC environment variables from the design.
- In CI/non-enforcing mode, missing live IdP values are reported as `not_configured` rather than causing Drupal reconstruction failure.
- When `OWC_IDENTITY_ENFORCE_SSO=1`, readiness fails unless all required client settings are present.

- [ ] Write failing tests for required env names, no secret echoing, and readiness fail-closed behavior when enforcement is enabled.
- [ ] Run focused tests and confirm RED.
- [ ] Implement idempotent client configuration using the installed module's generic client configuration entity API/config schema; never print the client secret.
- [ ] Implement readiness checks for module enablement, five role mappings, enforcement/break-glass posture, and required client settings.
- [ ] Document DEV/UAT callback registration, MFA prerequisite, enforcement sequence and recovery procedure.
- [ ] Re-run focused tests and confirm GREEN.

### Task 6: Clean-room CI and acceptance

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `docs/DRUPAL_IDENTITY_ACCEPTANCE.md`
- Modify: `docs/superpowers/plans/2026-09-13-drupal-editor-identity.md`

**Interfaces:**
- CI reconstructs Drupal with OIDC code installed, runs identity readiness in non-enforcing mode, verifies config alignment, and preserves existing content-migration checks.

- [ ] Extend CI shell validation to cover identity scripts.
- [ ] Run identity readiness after Drupal bootstrap and content migration verification.
- [ ] Verify `openid_connect`, `externalauth`, and `owc_identity` are enabled.
- [ ] Run `bun test`, lint/type-check, Next.js build, clean-room Drupal reconstruction, content import/idempotency/parity, identity readiness, CMS verification and bootstrap idempotency.
- [ ] Record exact branch head/run evidence in `docs/DRUPAL_IDENTITY_ACCEPTANCE.md`.
- [ ] Close all plan checkboxes only after fresh branch-head verification.
- [ ] Open a draft PR against `feature/drupal-content-migration` only after the final branch-head CI is green.