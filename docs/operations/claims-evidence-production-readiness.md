# OWC Claims Evidence Production Readiness

This runbook defines the configuration gate for enabling persistent claimant evidence and external lifecycle notifications. It does not assert that external services are live.

## Evidence repository

Production evidence persistence requires a dedicated OWC Supabase/PostgreSQL environment with privileged server access and a private `claim-evidence` object-storage bucket. Apply `src/lib/db/schema.sql` before `src/lib/db/claims-evidence.sql`. Do not grant anonymous bucket read/write access. Claimant uploads must enter through the OWC server route, which validates the claim-scoped upload grant, approved MIME type, file size, malware-scan policy, checksum and metadata before persistence.

Required configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `OWC_EVIDENCE_UPLOAD_SIGNING_SECRET` with at least 32 characters (server only)

The `claim_evidence` metadata model records storage path, SHA-256 digest, review status, scanner state, retention date and legal-hold status. Retention is a governance decision: there is no automatic deletion in the application. Evidence under legal hold must not be deleted even after the nominal retention date.

## Malware scanning

Configure `OWC_MALWARE_SCAN_URL` and, when required by the provider, `OWC_MALWARE_SCAN_API_KEY`. Set `OWC_REQUIRE_MALWARE_SCAN=true` for fail-closed production evidence ingestion. With this policy enabled, evidence upload is not production-ready unless the scanner endpoint is configured; unavailable or unconfigured scanning blocks the upload path.

Before activation, validate the selected scanner in DEV/UAT with clean, deliberately blocked test signatures supplied by the scanner vendor, oversized files, unsupported file types and scanner-unavailable conditions. Do not use live malicious payloads outside an approved security-test environment.

## Email and SMS notifications

The application sends lifecycle events only through the server-side notification gateway abstraction. Configure:
- `OWC_NOTIFICATION_API_URL`
- `OWC_NOTIFICATION_API_KEY` when required by the selected gateway

`claim_notifications` is the outbox/audit record. `attempt_count` and `next_attempt_at` allow an operations worker to retry queued/failed deliveries without losing delivery history. Sent and suppressed records are terminal. This repository does not provision a scheduler or a paid notification provider.

## Readiness validation

The operational readiness endpoint/model must show the secure evidence repository as ready only when privileged Supabase access and a sufficiently strong upload-signing secret are configured, with a malware scanner also configured whenever scanning is mandatory. CPPS, Drupal, scanner and notification-gateway readiness remain separately visible so missing dependencies cannot be hidden by the evidence check.

Repository verification commands:

```bash
bun test
bun run lint
bun run build
```

GitHub Actions additionally reconstructs the Drupal CMS in an isolated Docker stack. Feature branches must never execute the Ubuntu production deployment job.

## External dependencies not satisfied by this repository

The following require OWC/agency action or approved provisioning and must remain explicitly marked configuration-required until verified: production OWC Supabase project/storage bucket; malware-scanning service; email/SMS provider; CPPS UAT/production endpoint and credentials; real corporate/government OIDC application and MFA users; production Ubuntu host, DNS and TLS certificates; backup/restore infrastructure; formal security testing and approval.
