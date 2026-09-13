# Drupal Editor Identity Acceptance

## Scope

This acceptance record covers the OWC Drupal editor identity work package on `feature/drupal-editor-identity`.

Implemented scope:

- OpenID Connect authentication support for Drupal editors.
- OWC identity policy module for local-login enforcement and audit controls.
- Identity-provider MFA boundary; Drupal does not implement or bypass MFA.
- Deterministic group-to-role mapping for `cms_administrator`, `content_editor`, `reviewer`, `publisher`, and `auditor`.
- UID 1 break-glass local recovery path controlled by explicit environment policy.
- Runtime OIDC client provisioning from environment/secret inputs without committed client secrets.
- Fail-closed readiness when SSO enforcement is enabled without a configured OIDC client.
- Clean-room reconstruction and identity verification in CI.

## Functional verification evidence

Functional verification head:

`d2f03bfd19aec353a2bd866953211c9ebc3cf478`

GitHub Actions run:

`34751933071`

Fresh verification evidence from that run:

- `Test · Lint · Type-check · Build`: success.
- Bun test suite: success.
- Lint/type-check: success.
- Next.js build: success.
- Drupal clean-room reconstruction: success.
- Canonical content export/import: success.
- Second import idempotency check: success.
- Source-to-Drupal parity verification: success.
- CI OIDC client provisioning: success.
- Drupal editor identity readiness: success.
- Reconstructed CMS verification: success.
- Bootstrap idempotency: success.
- Feature-branch production deployment: intentionally skipped.

The CI path also verifies the negative condition: SSO enforcement is not considered ready unless the required OIDC client configuration is present.

## External activation dependency

Repository acceptance does not mean live production SSO/MFA is active. Production activation still requires agency-controlled identity-provider inputs:

- OIDC application registration for DEV/UAT/production as applicable.
- Approved callback/redirect URI registration.
- Real client ID and secret supplied through the deployment secret store.
- MFA policy enabled at the identity provider.
- Test identities assigned to the five approved OWC CMS groups.
- DEV/UAT sign-in, role-mapping, logout, recovery and audit acceptance testing.

Until those external identity-provider inputs are supplied, the repository implementation remains deployment-ready but live OIDC authentication must not be represented as production-connected.

## Review gate

Draft PR: `#5`, targeting `feature/drupal-content-migration`.

The PR must remain draft until the latest branch head passes CI and review findings contain no unresolved Critical or Important issues.
