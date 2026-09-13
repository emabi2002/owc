# OWC Final Production Cutover Runbook

## Purpose and control boundary

This runbook defines the operator-controlled sequence for a future authorized OWC production cutover. It **does not** authorize a go-live and the repository readiness package does not deploy, merge, change DNS, rotate credentials, modify production data, move funds or invoke a live external transaction. Every production action remains subject to the approved change process, named accountable owners and an explicit GO decision from the cutover-readiness evaluator using genuine production evidence.

Reference/sandbox success demonstrates functional readiness only. It must never be substituted for required live CPPS, agency, identity, infrastructure, notification, malware-scanning, business or security acceptance.

## Phase 0 — decision freeze

Before any change begins, record the immutable **release SHA**, target environment, approved change window, cutover lead, technical leads, business authority, security authority and rollback authority. Freeze unapproved application/content/configuration changes and establish the cutover communications channel and incident escalation path.

Evaluate the final evidence file with `bun run cutover:readiness -- <evidence.json>`. A `NO-GO`, missing evidence, blocked dependency or incomplete production authorization stops the activity. The evaluator itself performs no production action.

## Phase 1 — pre-change protection

Confirm the most recent approved application/database/Drupal/evidence backups and the documented restore rehearsal. Record current application release SHA, database/schema level, Drupal configuration/content state, DNS/TLS routing state and relevant integration configuration versions. Validate production credentials through approved secret-management procedures without printing or copying secrets into logs or evidence documents.

Confirm the rollback decision owner and the location of rollback/recovery artifacts. Confirm that reference CPPS and sandbox agency services are disabled or clearly isolated from production traffic and presentation.

## Phase 2 — final data, content and configuration preparation

Under the approved change record, operators apply only the already-reviewed database migrations and security hardening required for the accepted release. Complete the approved final Drupal content migration, parity checks and editorial acceptance. Configure the approved production identity/OIDC/MFA, evidence storage/signing, malware scanner, notification gateway, CPPS and required agency endpoints.

Reconcile every configuration item to the accepted release SHA and evidence register. Do not replay CPPS, payment, banking or other external transaction history as part of application migration. Any mismatch between authoritative systems and the planned state is a cutover blocker until reconciled.

## Phase 3 — application and routing cutover

The actual application deployment, Nginx/TLS changes and DNS/routing actions are **operator-controlled** and occur only within the approved production change. Use the existing health-checked release procedure for the accepted release SHA. Confirm local health before normal traffic is exposed.

If a mandatory deployment or smoke condition fails, stop the sequence and invoke the rollback/reconciliation procedure. The readiness package does not automatically retry, bypass or override a failed production control.

## Phase 4 — smoke tests and reconciliation

Execute `docs/cutover/cutover-smoke-checklist.md`. At minimum verify public HTTPS/health/security headers, authentication/MFA/RBAC, Drupal published content, claim lodgement/tracking with approved test data, evidence upload/scanner behavior, notifications, live CPPS interoperability, required live external integrations, logs/alerts/monitoring, absence of browser-visible server credentials and the deployed release SHA.

Reconcile OWC state against CPPS and any external transaction or agency system touched by the cutover. Reference results cannot satisfy a live check. Any uncertain authoritative state remains a blocker and is handled according to `docs/cutover/rollback-reconciliation.md`.

## Phase 5 — stabilization and acceptance

Monitor the approved stabilization indicators and service desk/incident channels. Record defects, incidents, workarounds and reconciliation actions. Apply rollback criteria when agreed thresholds or mandatory controls fail.

The change is closed only after technical smoke evidence, security review, business acceptance, operations acceptance and authoritative-state reconciliation are complete. The final outcome and any residual risk acceptance are recorded in `docs/cutover/cutover-signoff-template.md` and linked to the evidence register.

## Mandatory stop conditions

Stop or remain NO-GO when the evaluator reports a blocker; the release SHA differs from approved evidence; backups or rollback ownership are not confirmed; production identity/RBAC controls fail; security blockers remain; business UAT is not signed; required CPPS or agency live acceptance is absent; smoke tests fail; or explicit production authorization is missing or withdrawn.
