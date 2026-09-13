# Final Cutover Readiness — TDD and Verification Record

Date: 14 September 2026

Branch: `feature/final-cutover-readiness`

This record covers repository-side Task 16 readiness controls only. It does **not** record or imply a production deployment, live cutover, DNS change, credential rotation, production data change, CPPS action, payment or other external transaction.

## RED 1 — package contract

Head: `e1113b49de52a8e53486c0494a7f9c07e00ef4cb`

GitHub Actions run: `34780507092`

Result:
- repository security assurance passed;
- 163 pre-existing tests passed;
- exactly 6 new Task 16 contract tests failed because the evaluator, CLI/template and runbooks were intentionally absent;
- no pre-existing OWC test regressed.

## RED 2 — evaluator behavior

Head: `5a26905ab45a31280b22392017e5dda87c7ec011`

GitHub Actions run: `34780554381`

Result:
- repository security assurance passed;
- 163 pre-existing tests passed;
- 12 new Task 16 tests failed: the 6 package-contract tests plus 6 evaluator-behavior tests;
- failures were caused by the intentionally absent evaluator/package, not a regression in existing OWC functions.

The behavior tests require: complete/evidenced/explicitly authorized input for `GO`; `NO-GO` for missing or duplicate gates, `BLOCKED`/`NOT_READY`, accepted gates without owner/evidence, `NOT_APPLICABLE` without an authorized scope decision, or missing distinct production authorization.

## GREEN 1 — pure evaluator

Head: `236c719e73143708e128f8876737a94f680a9ecf`

GitHub Actions run: `34780597609`

Result:
- all 6 evaluator-behavior tests passed;
- the first 3 package-contract tests passed;
- 172 tests passed overall;
- only 3 expected package tests remained RED because the local CLI/template and operational runbooks had not yet been added.

The evaluator is pure and side-effect free: it performs no network, deployment, DNS, database, credential, CPPS or external-system action.

## GREEN 2 — complete package before final bookkeeping

Head: `95538bece5354f4a23cb4280964d96e2402abdd7`

GitHub Actions run: `34780764719`

Result:
- deployment/security shell validation passed;
- repository security assurance passed;
- **175/175 Bun tests passed**;
- reference end-to-end UAT passed 7/7 scenarios and its evidence artifact uploaded successfully;
- lint/type-check passed;
- Next.js production build passed;
- Drupal clean-room reconstruction, content import, idempotence, source parity, OIDC configuration/verification and bootstrap idempotence all passed;
- production Ubuntu deployment was skipped because the branch is not `main`.

The complete package at this stage contains the 15-gate fail-closed evaluator, default `NOT_READY`/NO-GO evidence template, local evaluator CLI, evidence register, final cutover runbook, production smoke checklist, rollback/reconciliation procedure and human sign-off template.

## Final exact-head gate

After this verification record and the master task-status reconciliation are committed, the branch must be frozen and the full CI workflow rerun on that exact head. No Task 16 implementation or documentation commits may be added after the final exact-head verification without re-running the full gate.

Final acceptance requires confirmation of:
- shell/security validation;
- repository security assurance;
- all Bun tests including Task 16 behavior/contract tests;
- reference UAT and artifact upload;
- lint/type-check;
- production build;
- Drupal clean-room reconstruction;
- production deployment skipped on the feature branch.

The exact final head/run and draft PR are recorded in the pull-request evidence after that gate succeeds.
