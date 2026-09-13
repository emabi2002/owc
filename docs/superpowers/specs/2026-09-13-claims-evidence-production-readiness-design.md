# Claims Evidence Production Readiness Design

## Scope
Harden the already-implemented OWC evidence and notification pathways for production configuration without provisioning external services or changing CPPS authority.

## Boundaries
- Restricted evidence remains outside Drupal in private object storage.
- Browser clients never receive service-role credentials, storage credentials, malware-scanner credentials, or notification-provider credentials.
- Claimant evidence writes pass only through the validated OWC server route and short-lived claim-scoped upload grants.
- Production evidence uploads fail closed when malware scanning is required but unavailable.
- External notification delivery remains server-side and auditable; an unconfigured provider must not be represented as sent.
- CPPS discovery and live external services remain explicit external dependencies.

## Evidence repository controls
The `claim_evidence` metadata record is the audit index for private storage objects. Add retention metadata (`retention_until`, `legal_hold`) and scan-state metadata so records can support lifecycle governance without deleting evidence automatically in application code. The storage bucket remains private and is provisioned separately.

## Readiness policy
Operational readiness must distinguish mere endpoint presence from a production-safe evidence configuration. Evidence readiness requires privileged Supabase access, a sufficiently strong evidence-upload signing secret, and a malware-scanner endpoint when fail-closed scanning is enabled. Notification readiness requires a configured gateway endpoint; provider credentials remain optional only where the selected gateway explicitly supports credentialless private-network authentication.

## Notification delivery
Retain the existing provider abstraction and outbox. Add retry bookkeeping to persistent notification records so failed deliveries can be retried by an operations worker without losing audit history. This design does not introduce a scheduler or paid provider.

## Verification
Automated tests must cover readiness policy, evidence retention/scan metadata contracts, and notification retry-state behavior. CI must pass tests, lint/type-check and build on the exact feature-branch head before review.