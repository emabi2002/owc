# OWC Production Rollback and Reconciliation

## Principle

Rollback is not one action. Application code, database state, Drupal content, private evidence storage, CPPS, agency systems, payment/banking systems and DNS/TLS can each have different recovery boundaries. A technical rollback **does not** automatically reverse authoritative data or an external transaction.

All rollback actions are operator-controlled under the approved change and incident process. This document is a decision framework; it does not execute a rollback or contact a live service.

## Component boundaries

| Component | Possible technical action | Required reconciliation |
|---|---|---|
| Next.js application | Use the approved prior release via the existing health-checked release/rollback process | Confirm deployed release SHA, health, configuration compatibility and browser behavior. |
| OWC application database | Restore or forward-fix only under the approved recovery decision | Compare schema/data timestamps, claims, audit records and post-cutover writes before any restore. Never overwrite newer authoritative records without approval. |
| Drupal database/content/media | Restore/forward-fix according to the recovery runbook | Reconcile editorial revisions, published content, media and migration parity; preserve legitimate post-cutover editorial work where required. |
| Private evidence storage | Restore/recover only from approved backups/object history | Reconcile object identifiers, hashes, scan state, legal hold and retention metadata. Do not silently delete or duplicate claim evidence. |
| CPPS | No automatic rollback from OWC application scripts | Treat CPPS as authoritative for production claim/payment state. Re-query and reconcile each affected claim/payment according to the approved CPPS process. |
| External agency/payment systems | No automatic reverse or replay | Obtain the authoritative external transaction status and follow the agency/provider reversal or correction process where one exists. |
| DNS/TLS/Nginx/platform | Revert only through the approved infrastructure change | Confirm routing, certificate validity, firewall/allow-list state, monitoring and public health after the change. |

## Rollback decision record

For every rollback decision record the incident/change reference, release SHA, time, decision authority, affected components, reason, last known good state, backup reference, expected customer impact and reconciliation owner. Identify which components will be reverted, restored, held in place or forward-fixed.

A rollback of application code must not be treated as evidence that database, Drupal, CPPS or external systems have returned to their pre-cutover state.

## Reconciliation sequence

1. Freeze further non-essential writes where the approved incident procedure permits and capture timestamps/correlation references.
2. Record the application/database/Drupal version currently active and the intended recovery target.
3. Determine whether OWC accepted any claims, evidence, notifications or integration requests after the cutover point.
4. For each affected claim, compare OWC state with authoritative CPPS state. Resolve conflicts through the approved claims process; do not copy reference CPPS results into live records.
5. For each external transaction, notification or agency request, establish authoritative provider status before retrying. Never blindly replay a request because the application response was uncertain.
6. Reconcile database and Drupal content/media against backup/restore evidence and known post-cutover changes.
7. Repeat mandatory security, authentication, claims and monitoring smoke tests after recovery.
8. Record final reconciliation evidence, residual discrepancies, owner and business/security acceptance.

## Stop conditions

Escalate rather than automate when a payment or CPPS state is uncertain, a backup is not verified, evidence objects cannot be reconciled, a database restore would overwrite newer records, an agency transaction may already have succeeded, or security/business authorities have not accepted the recovery state.

Reference/sandbox services may be used to reproduce defects separately, but reference success does not prove that a live authoritative system was reconciled.
